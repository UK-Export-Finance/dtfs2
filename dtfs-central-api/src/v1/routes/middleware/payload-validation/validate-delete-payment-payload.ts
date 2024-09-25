import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

const DeletePaymentSchema = z.object({
  user: TfmSessionUserSchema,
});

export type DeletePaymentPayload = z.infer<typeof DeletePaymentSchema>;

export const validateDeletePaymentPayload = createValidationMiddlewareForSchema(DeletePaymentSchema);
