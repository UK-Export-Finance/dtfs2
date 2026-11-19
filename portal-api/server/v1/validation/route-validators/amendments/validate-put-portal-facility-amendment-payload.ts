import { validateSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';
import zod from 'zod';

const PutPortalFacilityAmendmentSchema = zod.object({
  amendment: PORTAL_FACILITY_AMENDMENT_USER_VALUES.partial(),
  dealId: zod.string(),
});

export const validatePutPortalFacilityAmendmentPayload = validateSchema(PutPortalFacilityAmendmentSchema);
