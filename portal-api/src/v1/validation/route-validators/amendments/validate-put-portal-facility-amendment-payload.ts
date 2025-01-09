import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';
import z from 'zod';

const PutPortalFacilityAmendmentSchema = z.object({
  amendment: PORTAL_FACILITY_AMENDMENT_USER_VALUES.partial(),
  dealId: z.string(),
});

export const validatePutPortalFacilityAmendmentPayload = createValidationMiddlewareForSchema(PutPortalFacilityAmendmentSchema);
