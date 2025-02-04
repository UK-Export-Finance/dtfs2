import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { AuditDetailsSchema, MongoObjectIdSchema } from './schemas';

const PatchPortalFacilityAmendmentStatusSchema = z.object({
  auditDetails: AuditDetailsSchema,
  dealId: MongoObjectIdSchema,
});

export type PatchPortalFacilityAmendmentStatusPayload = z.infer<typeof PatchPortalFacilityAmendmentStatusSchema>;

export const validatePatchPortalFacilityAmendmentStatusPayload = createValidationMiddlewareForSchema(PatchPortalFacilityAmendmentStatusSchema);
