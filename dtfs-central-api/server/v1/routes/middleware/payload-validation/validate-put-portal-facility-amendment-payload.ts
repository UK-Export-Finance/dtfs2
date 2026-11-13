import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema, MongoObjectIdSchema } from './schemas';

const PutPortalFacilityAmendmentSchema = zod.object({
  amendment: PORTAL_FACILITY_AMENDMENT_USER_VALUES.partial(),
  auditDetails: AuditDetailsSchema,
  dealId: MongoObjectIdSchema,
});

export type PutPortalFacilityAmendmentPayload = zod.infer<typeof PutPortalFacilityAmendmentSchema>;

export const validatePutPortalFacilityAmendmentPayload = validateSchema(PutPortalFacilityAmendmentSchema);
