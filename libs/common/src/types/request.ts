/**
 * Represents the possible input types for an Express request.
 *
 * - `string`: A string input.
 * - `Array<any>`: An array of any type.
 * - `Record<string, unknown>`: An object with string keys and values of any type.
 */
export type RequestInput = string | Array<any> | Record<string, unknown>;
