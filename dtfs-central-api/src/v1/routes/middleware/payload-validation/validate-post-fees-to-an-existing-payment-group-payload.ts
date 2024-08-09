import z from 'zod';
import { TfmSessionUserSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

const PostFeesToAnExistingPaymentGroupSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)).min(1),
  paymentIds: z.array(z.number().gte(1)).min(1),
  user: TfmSessionUserSchema,
});

export type PostFeesToAnExistingPaymentGroupPayload = z.infer<typeof PostFeesToAnExistingPaymentGroupSchema>;

export const validatePostFeesToAnExistingPaymentGroupPayload = createValidationMiddlewareForSchema(PostFeesToAnExistingPaymentGroupSchema);
