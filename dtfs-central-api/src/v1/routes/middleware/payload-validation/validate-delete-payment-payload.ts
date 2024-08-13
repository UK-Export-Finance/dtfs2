import z from 'zod';
import { TfmSessionUserSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

const DeletePaymentSchema = z.object({
  user: TfmSessionUserSchema,
});

export type DeletePaymentPayload = z.infer<typeof DeletePaymentSchema>;

export const validateDeletePaymentPayload = createValidationMiddlewareForSchema(DeletePaymentSchema);
