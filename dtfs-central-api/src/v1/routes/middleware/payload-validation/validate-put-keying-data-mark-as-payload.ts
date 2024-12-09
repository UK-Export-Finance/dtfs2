import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PutKeyingDataMarkAsSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PutKeyingDataMarkAsPayload = z.infer<typeof PutKeyingDataMarkAsSchema>;

export const validatePutKeyingDataMarkAsPayload = createValidationMiddlewareForSchema(PutKeyingDataMarkAsSchema);
