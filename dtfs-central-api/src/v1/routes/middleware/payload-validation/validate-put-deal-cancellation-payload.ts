import z from 'zod';
import { AuditDetails, TfmDealCancellation, createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { DEAL_CANCELLATION } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema } from './schemas';

const PutDealCancellationSchema: z.ZodType<{ dealCancellationUpdate: Partial<TfmDealCancellation>; auditDetails: AuditDetails }> = z.object({
  dealCancellationUpdate: DEAL_CANCELLATION.partial(),
  auditDetails: AuditDetailsSchema,
});

export type PutDealCancellationPayload = z.infer<typeof PutDealCancellationSchema>;

export const validatePutDealCancellationPayload = createValidationMiddlewareForSchema(PutDealCancellationSchema);
