import z from 'zod';
import { createValidationMiddlewareForSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

/**
 * Schema for validating submit amendment payload.
 */
const PatchPortalFacilitySubmitAmendmentSchema = z.object({
  auditDetails: AuditDetailsSchema,
  newStatus: z.enum([PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED]),
  referenceNumber: z.string(),
});

export type PatchPortalFacilitySubmitAmendmentPayload = z.infer<typeof PatchPortalFacilitySubmitAmendmentSchema>;

export const validatePatchPortalFacilitySubmitAmendmentPayload = createValidationMiddlewareForSchema(PatchPortalFacilitySubmitAmendmentSchema);
