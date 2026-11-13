import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PostRemoveFeesFromPaymentGroupSchema = zod.object({
  selectedFeeRecordIds: zod.array(zod.number().gte(1)).min(1),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostRemoveFeesFromPaymentGroupPayload = zod.infer<typeof PostRemoveFeesFromPaymentGroupSchema>;

export const validatePostRemoveFeesFromPaymentGroupPayload = validateSchema(PostRemoveFeesFromPaymentGroupSchema);
