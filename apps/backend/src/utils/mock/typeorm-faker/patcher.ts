import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { ColumnOptions, ColumnType, getMetadataArgsStorage } from 'typeorm';

import { faker } from '@faker-js/faker';
import { ColumnMode } from 'typeorm/metadata-args/types/ColumnMode.js';
import { UtilService } from './util.service.js';
import { NullableType } from '../../types/nullable.type.js';

type ValueOf<T> = T[keyof T] | Date | number | string | boolean | null;

export class EntityPatcher {
  /**
   * Load types from Typeorm decorators then patch random values with faker.
   * The result, plain object, is transformed by plainToInstance as class instance
   *
   * @param EntityClass Entity Class variable
   * @param classTransformOptions
   * @returns Entity Type
   */
  static patch<T>(
    EntityClass: new () => T,
    classTransformOptions: ClassTransformOptions = {},
  ): T {
    let fakeEntity = {} as Partial<T> | T;
    const filteredPropertyDescriptor =
      getMetadataArgsStorage().filterColumns(EntityClass);

    const SuperClass = Object.getPrototypeOf(EntityClass);

    const hasSuperClass = !UtilService.isEmptyObject(SuperClass);

    if (hasSuperClass) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      fakeEntity = EntityPatcher.patch(SuperClass);
    }

    for (const propertyDescriptor of filteredPropertyDescriptor) {
      const { propertyName, options, mode } = propertyDescriptor;

      fakeEntity[propertyName as keyof T] = EntityPatcher.patchByMode(
        mode,
        options,
      ) as unknown as (T | Partial<T>)[keyof T];
    }

    return plainToInstance(EntityClass, fakeEntity, {
      ignoreDecorators: true,
      ...classTransformOptions,
    });
  }

  static patchByMode<T>(mode: ColumnMode, options: ColumnOptions): ValueOf<T> {
    let value: ValueOf<T> | Date | null;

    switch (mode) {
      case 'regular':
        value = EntityPatcher.patchValueByTypeormColumnOptions<T>(options);
        break;
      default:
        value = EntityPatcher.patchValueByTypeormColumnMode(mode);
        break;
    }

    return value;
  }

  static patchValueByTypeormColumnOptions<T>(
    options: ColumnOptions,
  ): ValueOf<T> | null {
    const {
      type: propertyTypeOrTypeFunction,
      enum: enumValue,
      default: defaultValue,
    } = options;

    const propertyType: ColumnType = (
      propertyTypeOrTypeFunction instanceof Function
        ? typeof propertyTypeOrTypeFunction()
        : propertyTypeOrTypeFunction
    ) as ColumnType;

    let value: ValueOf<T>;

    if (defaultValue !== undefined) {
      value = defaultValue;
    } else if (enumValue) {
      const stringArrayEnums = enumValue as string[];
      const randomIndex = faker.number.int({
        min: 0,
        max: stringArrayEnums.length - 1,
      });
      value = stringArrayEnums[randomIndex] as unknown as ValueOf<T>;
    } else if (propertyType) {
      value = EntityPatcher.patchValueByTypeormColumnType(propertyType);
    } else {
      value = null;
    }

    return value;
  }

  static patchValueByTypeormColumnMode(mode: string): NullableType<Date> {
    let value: NullableType<Date>;

    switch (mode) {
      case 'createDate':
      case 'updateDate':
        value = new Date();
        break;
      case 'deleteDate':
      default:
        value = null;
        break;
    }

    return value;
  }

  static patchValueByTypeormColumnType<T>(
    typeormColumnTypeString: ColumnType,
  ): ValueOf<T> {
    let value: ValueOf<T>;

    switch (typeormColumnTypeString) {
      // TypeORM PrimaryGeneratedColumnType
      case 'int':
      case 'int2':
      case 'int4':
      case 'int8':
      case 'int64':
      case 'integer':
      case 'unsigned big int':
      case 'tinyint':
      case 'smallint':
      case 'mediumint':
      case 'bigint':
      case 'dec':
      case 'decimal':
      case 'smalldecimal':
      case 'fixed':
      case 'numeric':
      case 'number':
      case 'float':
      case 'float4':
      case 'float8':
      case 'double':
      case 'double precision':
      case 'real':
        value = faker.number.int();
        break;
      // TypeORM WithLengthColumnType
      case 'character varying':
      case 'nvarchar':
      case 'character':
      case 'varchar':
      case 'char':
      case 'nchar':
      case 'varchar2':
      case 'nvarchar2':
      case 'alphanum':
      case 'raw':
      case 'binary':
      case 'varbinary':
      case 'string':
      case 'tinytext':
      case 'mediumtext':
      case 'text':
      case 'ntext':
      case 'citext':
      case 'longtext':
      case 'shorttext':
        value = faker.string.nanoid();
        break;
      // TypeORM Parital SimpleColumnType
      case 'date':
      case 'datetime':
      case 'datetime2':
      case 'datetimeoffset':
      case 'time':
      case 'time with time zone':
      case 'time without time zone':
      case 'timestamp':
      case 'timestamp without time zone':
      case 'timestamp with time zone':
      case 'timestamp with local time zone':
        value = new Date();
        break;
      case 'boolean':
      case 'bool':
        value = faker.datatype.boolean();
        break;
      case 'jsonb':
      case 'json':
      case 'smallmoney':
      case 'money':
      case 'simple-array':
      case 'simple-json':
      case 'simple-enum':
      case 'array':
      default:
        value = null;
        break;
    }

    return value;
  }
}
