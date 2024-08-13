import z from 'zod';

export const dateFromIsoStringSchema = z
  .string()
  .datetime()
  .transform((val) => new Date(val));
