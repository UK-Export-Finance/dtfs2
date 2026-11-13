import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema } from './schemas';

const PatchPortalFacilityAmendmentSchema = zod.object({
  update: PORTAL_FACILITY_AMENDMENT_USER_VALUES.partial(),
  auditDetails: AuditDetailsSchema,
});

export type PatchPortalFacilityAmendmentPayload = zod.infer<typeof PatchPortalFacilityAmendmentSchema>;

export const validatePatchPortalFacilityAmendmentPayload = validateSchema(PatchPortalFacilityAmendmentSchema);
