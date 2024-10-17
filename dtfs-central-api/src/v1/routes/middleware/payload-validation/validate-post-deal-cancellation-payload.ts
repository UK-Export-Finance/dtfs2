import z from 'zod';
import { AuditDetails, createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

const PostDealCancellationSchema: z.ZodType<{ auditDetails: AuditDetails }> = z.object({
  auditDetails: AuditDetailsSchema,
});

export type PostDealCancellationPayload = z.infer<typeof PostDealCancellationSchema>;

export const validatePostDealCancellationPayload = createValidationMiddlewareForSchema(PostDealCancellationSchema);
