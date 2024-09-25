import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { TfmSessionUserSchema } from './schemas';

const PostRemoveFeesFromPaymentGroupSchema = z.object({
  selectedFeeRecordIds: z.array(z.number().gte(1)).min(1),
  user: TfmSessionUserSchema,
});

export type PostRemoveFeesFromPaymentGroupPayload = z.infer<typeof PostRemoveFeesFromPaymentGroupSchema>;

export const validatePostRemoveFeesFromPaymentGroupPayload = createValidationMiddlewareForSchema(PostRemoveFeesFromPaymentGroupSchema);
