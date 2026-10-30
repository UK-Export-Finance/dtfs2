import zod from 'zod';

export const dateFromIsoStringSchema = zod
  .string()
  .datetime()
  .transform((value) => new Date(value));
