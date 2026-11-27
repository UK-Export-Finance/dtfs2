import z from 'zod';

export const dateFromIsoStringSchema = z.iso.datetime().transform((val) => new Date(val));
