import z from 'zod';
import { AuditDetails, createValidationMiddlewareForSchema, TfmDealCancellation } from '@ukef/dtfs2-common';
import { DEAL_CANCELLATION } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema } from './schemas';

const PostDealCancellationSchema: z.ZodType<{ cancellation: TfmDealCancellation; auditDetails: AuditDetails }> = z.object({
  cancellation: DEAL_CANCELLATION,
  auditDetails: AuditDetailsSchema,
});

export type PostDealCancellationPayload = z.infer<typeof PostDealCancellationSchema>;

export const validatePostDealCancellationPayload = createValidationMiddlewareForSchema(PostDealCancellationSchema);
