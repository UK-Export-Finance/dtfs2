import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PostAddFeesToAnExistingPaymentGroupSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)).min(1),
  paymentIds: z.array(z.number().gte(1)).min(1),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostAddFeesToAnExistingPaymentGroupPayload = z.infer<typeof PostAddFeesToAnExistingPaymentGroupSchema>;

export const validatePostAddFeesToAnExistingPaymentGroupPayload = createValidationMiddlewareForSchema(PostAddFeesToAnExistingPaymentGroupSchema);
