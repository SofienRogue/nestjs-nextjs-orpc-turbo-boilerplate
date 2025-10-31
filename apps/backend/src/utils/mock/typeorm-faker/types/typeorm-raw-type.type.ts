import { CamelCaseToSnakeCase } from './camel-case-to-snake.type.js';

/**
 *
 * TypeORMRawColumns.
 */
export type TypeORMRawColumns<
  Entity,
  EntityClassName extends string,
  AdditionalFields extends string,
  Joiner = EntityClassName extends '' ? '' : '_',
  ConvertedPropertyAsSnake = `${Uncapitalize<EntityClassName>}${Extract<
    Joiner,
    string
  >}${CamelCaseToSnakeCase<Extract<keyof Entity, string>>}`,
  ValueOf = Entity[keyof Entity],
> = {
  [key in Extract<
    ConvertedPropertyAsSnake | AdditionalFields,
    string
  >]?: ValueOf;
};
