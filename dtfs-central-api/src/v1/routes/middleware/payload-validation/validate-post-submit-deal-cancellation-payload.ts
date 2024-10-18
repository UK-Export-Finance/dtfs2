import z from 'zod';
import { AuditDetails, createValidationMiddlewareForSchema, TfmDealCancellation } from '@ukef/dtfs2-common';
import { DEAL_CANCELLATION } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema } from './schemas';

const PostSubmitDealCancellationSchema: z.ZodType<{ cancellation: TfmDealCancellation; auditDetails: AuditDetails }> = z.object({
  cancellation: DEAL_CANCELLATION,
  auditDetails: AuditDetailsSchema,
});

export type SubmitDealCancellationPayload = z.infer<typeof PostSubmitDealCancellationSchema>;

export const validatePostSubmitDealCancellationPayload = createValidationMiddlewareForSchema(PostSubmitDealCancellationSchema);
