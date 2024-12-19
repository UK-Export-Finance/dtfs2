import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';

export const validatePutPortalFacilityAmendmentPayload = createValidationMiddlewareForSchema(PORTAL_FACILITY_AMENDMENT_USER_VALUES.partial());
