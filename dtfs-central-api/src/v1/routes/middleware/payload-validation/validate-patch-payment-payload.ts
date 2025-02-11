import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PatchPaymentSchema = z.object({
  paymentAmount: z.number().gte(0),
  datePaymentReceived: z.coerce.date(),
  paymentReference: z.union([z.string(), z.null().transform(() => undefined)]),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PatchPaymentPayload = z.infer<typeof PatchPaymentSchema>;

export const validatePatchPaymentPayload = createValidationMiddlewareForSchema(PatchPaymentSchema);
