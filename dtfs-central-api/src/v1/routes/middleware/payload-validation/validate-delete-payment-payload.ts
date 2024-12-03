import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const DeletePaymentSchema = z.object({
  user: TFM_SESSION_USER_SCHEMA,
});

export type DeletePaymentPayload = z.infer<typeof DeletePaymentSchema>;

export const validateDeletePaymentPayload = createValidationMiddlewareForSchema(DeletePaymentSchema);
