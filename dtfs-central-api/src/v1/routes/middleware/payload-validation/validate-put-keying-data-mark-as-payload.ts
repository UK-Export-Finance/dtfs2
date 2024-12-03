import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

const PutKeyingDataMarkAsSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)),
  user: TfmSessionUserSchema,
});

export type PutKeyingDataMarkAsPayload = z.infer<typeof PutKeyingDataMarkAsSchema>;

export const validatePutKeyingDataMarkAsPayload = createValidationMiddlewareForSchema(PutKeyingDataMarkAsSchema);
