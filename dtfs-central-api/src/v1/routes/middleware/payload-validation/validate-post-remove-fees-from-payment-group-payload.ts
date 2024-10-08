import z from 'zod';
import { TfmSessionUserSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

const PostRemoveFeesFromPaymentGroupSchema = z.object({
  selectedFeeRecordIds: z.array(z.number().gte(1)).min(1),
  user: TfmSessionUserSchema,
});

export type PostRemoveFeesFromPaymentGroupPayload = z.infer<typeof PostRemoveFeesFromPaymentGroupSchema>;

export const validatePostRemoveFeesFromPaymentGroupPayload = createValidationMiddlewareForSchema(PostRemoveFeesFromPaymentGroupSchema);
