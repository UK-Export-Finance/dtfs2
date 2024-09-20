import z from 'zod';
import { AuditDetails, TfmDealCancellation } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema.ts';

const PutDealCancellationSchema: z.ZodType<{ dealCancellationUpdate: Partial<TfmDealCancellation>; auditDetails: AuditDetails }> = z.object({
  dealCancellationUpdate: z
    .object({
      reason: z.string(),
      bankRequestDate: z.number(),
      effectiveFrom: z.number(),
    })
    .partial(),
  auditDetails: AuditDetailsSchema,
});

export type PutDealCancellationPayload = z.infer<typeof PutDealCancellationSchema>;

export const validatePutDealCancellationPayload = createValidationMiddlewareForSchema(PutDealCancellationSchema);
