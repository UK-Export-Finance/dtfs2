import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema } from './schemas';

const PatchPortalFacilityAmendmentSchema = z.object({
  update: PORTAL_FACILITY_AMENDMENT_USER_VALUES.partial(),
  auditDetails: AuditDetailsSchema,
});

export type PatchPortalFacilityAmendmentPayload = z.infer<typeof PatchPortalFacilityAmendmentSchema>;

export const validatePatchPortalFacilityAmendmentPayload = createValidationMiddlewareForSchema(PatchPortalFacilityAmendmentSchema);
