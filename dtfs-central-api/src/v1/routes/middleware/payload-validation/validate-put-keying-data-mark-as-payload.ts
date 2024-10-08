import z from 'zod';
import { TfmSessionUserSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

const PutKeyingDataMarkAsSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)),
  user: TfmSessionUserSchema,
});

export type PutKeyingDataMarkAsPayload = z.infer<typeof PutKeyingDataMarkAsSchema>;

export const validatePutKeyingDataMarkAsPayload = createValidationMiddlewareForSchema(PutKeyingDataMarkAsSchema);
