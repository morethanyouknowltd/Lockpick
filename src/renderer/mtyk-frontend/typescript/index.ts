export type KebabToCamelCase<S extends string> =
  S extends `${infer T}-${infer U}`
    ? `${T}${Capitalize<KebabToCamelCase<U>>}`
    : S

export type SnakeToCamelCase<S extends string> =
  S extends `${infer T}-${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S

export type ValOrCreator<T, Args extends any[] = any[]> =
  | T
  | ((...args: Args) => T)

export type SomeRequired<T, S extends keyof T> = Omit<T, S> &
  Required<Pick<T, S>>

export type Optional<T> = T | undefined
