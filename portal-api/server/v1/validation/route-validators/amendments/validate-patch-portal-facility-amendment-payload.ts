import { validateSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';
import zod from 'zod';

const PatchPortalFacilityAmendmentSchema = zod.object({
  update: PORTAL_FACILITY_AMENDMENT_USER_VALUES.partial(),
});

export const validatePatchPortalFacilityAmendmentPayload = validateSchema(PatchPortalFacilityAmendmentSchema);
