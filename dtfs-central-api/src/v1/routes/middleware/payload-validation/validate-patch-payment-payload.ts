import z from 'zod';
import { TfmSessionUserSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

const PatchPaymentSchema = z.object({
  paymentAmount: z.number().gte(0),
  datePaymentReceived: z.coerce.date(),
  paymentReference: z.union([z.string(), z.null().transform(() => undefined)]),
  user: TfmSessionUserSchema,
});

export type PatchPaymentPayload = z.infer<typeof PatchPaymentSchema>;

export const validatePatchPaymentPayload = createValidationMiddlewareForSchema(PatchPaymentSchema);
