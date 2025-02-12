import z from 'zod';
import { createValidationMiddlewareForSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { AuditDetailsSchema, MongoObjectIdSchema } from './schemas';

const PatchPortalFacilityAmendmentStatusSchema = z.object({
  auditDetails: AuditDetailsSchema,
  dealId: MongoObjectIdSchema,
  newStatus: z.enum([PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL]),
});

export type PatchPortalFacilityAmendmentStatusPayload = z.infer<typeof PatchPortalFacilityAmendmentStatusSchema>;

export const validatePatchPortalFacilityAmendmentStatusPayload = createValidationMiddlewareForSchema(PatchPortalFacilityAmendmentStatusSchema);
