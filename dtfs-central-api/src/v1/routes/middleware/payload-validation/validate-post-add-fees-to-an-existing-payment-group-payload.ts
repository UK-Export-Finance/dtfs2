import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

const PostAddFeesToAnExistingPaymentGroupSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)).min(1),
  paymentIds: z.array(z.number().gte(1)).min(1),
  user: TfmSessionUserSchema,
});

export type PostAddFeesToAnExistingPaymentGroupPayload = z.infer<typeof PostAddFeesToAnExistingPaymentGroupSchema>;

export const validatePostAddFeesToAnExistingPaymentGroupPayload = createValidationMiddlewareForSchema(PostAddFeesToAnExistingPaymentGroupSchema);
