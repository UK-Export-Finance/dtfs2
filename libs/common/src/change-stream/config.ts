import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const changeStreamConfigSchema = z.union([
  z.object({
    DELETION_AUDIT_LOGS_TTL_SECONDS: z.coerce.number(),
    CHANGE_STREAM_ENABLED: z.union([z.literal('true'), z.literal(true)]),
  }),
  z.object({
    CHANGE_STREAM_ENABLED: z.union([z.literal('false'), z.literal(false), z.literal('')]).optional(),
    // If change stream is not enabled, this variable should never be used
    DELETION_AUDIT_LOGS_TTL_SECONDS: z.coerce.number().optional().default(0),
  }),
]);

export const changeStreamConfig = changeStreamConfigSchema.parse(process.env);
