import z from 'zod';

/**
 * Helper to map T into `ZodRawShape`. This allows an object to be passed into generics like `z.ZodObject`
 */
export type ZodTypeFromObject<T extends object> = {
  [K in keyof T]: z.ZodType<T[K]>;
};
