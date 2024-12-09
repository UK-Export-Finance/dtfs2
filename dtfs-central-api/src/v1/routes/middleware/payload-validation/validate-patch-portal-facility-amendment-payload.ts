import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema } from './schemas';

const PatchPortalFacilityAmendmentSchema = z.object({
  update: PORTAL_FACILITY_AMENDMENT.partial(),
  auditDetails: AuditDetailsSchema,
});

export type PatchPortalFacilityAmendmentPayload = z.infer<typeof PatchPortalFacilityAmendmentSchema>;

export const validatePatchPortalFacilityAmendmentPayload = createValidationMiddlewareForSchema(PatchPortalFacilityAmendmentSchema);
