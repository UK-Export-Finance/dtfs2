import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { PORTAL_FACILITY_AMENDMENT } from '@ukef/dtfs2-common/schemas';
import { AuditDetailsSchema, MongoObjectIdSchema } from './schemas';

const PutPortalFacilityAmendmentSchema = z.object({
  amendment: PORTAL_FACILITY_AMENDMENT.partial(),
  auditDetails: AuditDetailsSchema,
  dealId: MongoObjectIdSchema,
});

export type PutPortalFacilityAmendmentPayload = z.infer<typeof PutPortalFacilityAmendmentSchema>;

export const validatePutPortalFacilityAmendmentPayload = createValidationMiddlewareForSchema(PutPortalFacilityAmendmentSchema);
