import z from 'zod';
import { createValidationMiddlewareForSchema } from '@ukef/dtfs2-common';
import { AuditDetailsSchema, MongoObjectIdSchema } from './schemas';

const PostSubmitPortalFacilityAmendmentToCheckerSchema = z.object({
  auditDetails: AuditDetailsSchema,
  dealId: MongoObjectIdSchema,
});

export type PostSubmitPortalFacilityAmendmentToCheckerPayload = z.infer<typeof PostSubmitPortalFacilityAmendmentToCheckerSchema>;

export const validatePostSubmitPortalFacilityAmendmentToCheckerPayload = createValidationMiddlewareForSchema(PostSubmitPortalFacilityAmendmentToCheckerSchema);
