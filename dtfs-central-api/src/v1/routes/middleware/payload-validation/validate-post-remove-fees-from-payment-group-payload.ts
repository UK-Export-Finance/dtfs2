import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PostRemoveFeesFromPaymentGroupSchema = z.object({
  selectedFeeRecordIds: z.array(z.number().gte(1)).min(1),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostRemoveFeesFromPaymentGroupPayload = z.infer<typeof PostRemoveFeesFromPaymentGroupSchema>;

export const validatePostRemoveFeesFromPaymentGroupPayload = createValidationMiddlewareForSchema(PostRemoveFeesFromPaymentGroupSchema);
