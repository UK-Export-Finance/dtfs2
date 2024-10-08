import z from 'zod';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';
import { AuditDetailsSchema } from './schemas';

const PostFacilityAmendmentSchema = z.object({
  auditDetails: AuditDetailsSchema,
});

export type PostFacilityAmendmentPayload = z.infer<typeof PostFacilityAmendmentSchema>;

export const validatePostFacilityAmendmentPayload = createValidationMiddlewareForSchema(PostFacilityAmendmentSchema);
