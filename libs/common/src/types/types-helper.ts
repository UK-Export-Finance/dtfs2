export type ValuesOf<T> = T[keyof T];

// https://www.totaltypescript.com/concepts/the-prettify-helper
export type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

export type SafeExclude<T extends string, K extends T> = Exclude<T, K>;

/**
 * Converts all property types of an object to
 * `unknown`
 *
 * @example
 * type Body = {
 *   id: number;
 *   name: string;
 * };
 *
 * type PreValidationBody = Unknown<Body>;
 * //   ^? { id: unknown; name: unknown }
 */
export type Unknown<T> = {
  [K in keyof T]: unknown;
};
