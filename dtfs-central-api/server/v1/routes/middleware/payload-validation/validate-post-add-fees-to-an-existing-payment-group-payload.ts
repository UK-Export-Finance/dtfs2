import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PostAddFeesToAnExistingPaymentGroupSchema = zod.object({
  feeRecordIds: zod.array(zod.number().gte(1)).min(1),
  paymentIds: zod.array(zod.number().gte(1)).min(1),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostAddFeesToAnExistingPaymentGroupPayload = zod.infer<typeof PostAddFeesToAnExistingPaymentGroupSchema>;

export const validatePostAddFeesToAnExistingPaymentGroupPayload = validateSchema(PostAddFeesToAnExistingPaymentGroupSchema);
