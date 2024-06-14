import { z } from 'zod';
import dotenv from 'dotenv';
import { zBooleanStrictCoerce } from '../helpers';

dotenv.config();

const changeStreamConfigSchema = z.union([
  z.object({
    DELETION_AUDIT_LOGS_TTL_SECONDS: z.coerce.number(),
    CHANGE_STREAM_ENABLED: zBooleanStrictCoerce.pipe(z.literal(true)),
  }),
  z.object({
    CHANGE_STREAM_ENABLED: zBooleanStrictCoerce.pipe(z.literal(false)).optional().default(false),
    // If change stream is not enabled, this variable should never be used
    DELETION_AUDIT_LOGS_TTL_SECONDS: z.coerce.number().optional().default(0),
  }),
]);

export const changeStreamConfig = changeStreamConfigSchema.parse(process.env);
