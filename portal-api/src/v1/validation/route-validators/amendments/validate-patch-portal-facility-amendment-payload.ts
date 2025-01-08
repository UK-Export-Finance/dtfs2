import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';
import z from 'zod';

const PatchPortalFacilityAmendmentSchema = z.object({
  update: PORTAL_FACILITY_AMENDMENT_USER_VALUES.partial(),
});

export const validatePatchPortalFacilityAmendmentPayload = createValidationMiddlewareForSchema(PatchPortalFacilityAmendmentSchema);
