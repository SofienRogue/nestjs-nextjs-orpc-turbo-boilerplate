/* eslint-disable @typescript-eslint/unbound-method */
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { SinonSandbox, SinonStatic, SinonStubbedInstance } from 'sinon';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { TypeORMRawColumns } from './types/typeorm-raw-type.type.js';
import { EntityPatcher } from './patcher.js';
import { UtilService } from './util.service.js';
import { QueryBuilderStubber } from './query-builder-stubber.js';

export default class Stubber {
  private static queryBuilderStubber = new QueryBuilderStubber();

  /**
   * @param EntityClass Entity Class variable
   * @param options
   * @param classTransformOptions
   * @returns Instance of Entity Class which is patched random values to properties
   */
  public static stubOne<T>(
    EntityClass: new () => T,
    options?: Partial<T>,
    classTransformOptions?: ClassTransformOptions,
  ): T {
    const fakeEntity = EntityPatcher.patch(EntityClass, classTransformOptions);

    return plainToInstance(
      EntityClass,
      {
        ...fakeEntity,
        ...options,
      },
      {
        ignoreDecorators: true,
        ...classTransformOptions,
      },
    );
  }

  public static stub<T>(
    EntityClass: new () => T,
    count = 10,
    options?: Partial<T> | undefined,
    classTransformOptions?: ClassTransformOptions,
  ): T[] {
    return Array(count)
      .fill(0)
      .map(() => Stubber.stubOne(EntityClass, options, classTransformOptions));
  }

  public static stubRaw<
    Entity,
    ClassName extends string,
    AdditionalFields extends string,
  >(
    EntityClass: new () => Entity,
    count = 10,
    options?:
      | Partial<TypeORMRawColumns<Entity, ClassName, AdditionalFields>>
      | undefined,
  ): Array<TypeORMRawColumns<Entity, ClassName, AdditionalFields>> {
    return Array(count)
      .fill(0)
      .map(() => Stubber.stubRawOne(EntityClass, options));
  }

  /**
   * @param EntityClass Entity Class variable
   * @param options
   * @returns Raw Instance of Entity Class which is patched random values to properties
   */
  public static stubRawOne<
    Entity,
    ClassName extends string,
    AdditionalFields extends string,
  >(
    EntityClass: new () => Entity,
    options?: Partial<TypeORMRawColumns<Entity, ClassName, AdditionalFields>>,
  ): TypeORMRawColumns<Entity, ClassName, AdditionalFields> {
    const className = EntityClass.name;

    const fakeEntity = EntityPatcher.patch(EntityClass);

    const convertedRawFakeEntity: TypeORMRawColumns<
      Entity,
      ClassName,
      AdditionalFields
    > = {};

    for (const property in fakeEntity) {
      if (Object.prototype.hasOwnProperty.call(fakeEntity, property)) {
        const uncapitalizedClassName = UtilService.uncapitalize(className);
        const uncapitalizedProperty = property
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase();

        const rawKey = (uncapitalizedClassName +
          '_' +
          uncapitalizedProperty) as keyof TypeORMRawColumns<
          Entity,
          ClassName,
          AdditionalFields
        >;
        convertedRawFakeEntity[rawKey] = fakeEntity[property];
      }
    }

    Object.assign(convertedRawFakeEntity, {
      ...convertedRawFakeEntity,
      ...options,
    });
    return convertedRawFakeEntity;
  }

  public static stubQueryBuilder<Entity extends ObjectLiteral>(
    sandbox: SinonStatic | SinonSandbox,
    EntityClass: new () => Entity,
    customStubOrStubs?: Entity | Entity[],
  ): SinonStubbedInstance<SelectQueryBuilder<Entity>> {
    let stubs: Entity[];
    const stubRaws = Stubber.stubRaw(EntityClass);

    const defaultStubs = Stubber.stub(EntityClass);

    if (customStubOrStubs && customStubOrStubs instanceof Array) {
      stubs = customStubOrStubs;
    } else if (customStubOrStubs) {
      stubs = [customStubOrStubs, ...defaultStubs] as Entity[];
    } else {
      stubs = defaultStubs;
    }

    return Stubber.queryBuilderStubber._stubQueryBuilder(
      sandbox,
      stubs,
      stubRaws,
    );
  }
}

export const stub = Stubber.stub;
export const stubOne = Stubber.stubOne;
export const stubQueryBuilder = Stubber.stubQueryBuilder;
export const stubRaw = Stubber.stubRaw;
export const stubRawOne = Stubber.stubRawOne;
