import z from 'zod';

export type ZodTypeFromObject<T extends object> = {
  [K in keyof T]: z.ZodType<T[K]>;
};
