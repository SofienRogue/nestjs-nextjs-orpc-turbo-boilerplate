export type CamelCaseToSnakeCase<
  T extends string,
  Joiner extends '' | '_' = '',
> = T extends `${infer Character}${infer Rest}`
  ? Character extends Uppercase<Character>
    ? `${Joiner}${Lowercase<Character>}${CamelCaseToSnakeCase<Rest, '_'>}`
    : `${Character}${CamelCaseToSnakeCase<Rest, '_'>}`
  : '';
