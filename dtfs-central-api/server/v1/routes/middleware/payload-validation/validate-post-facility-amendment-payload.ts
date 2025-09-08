import z from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

const PostFacilityAmendmentSchema = z.object({
  auditDetails: AuditDetailsSchema,
});

export type PostFacilityAmendmentPayload = z.infer<typeof PostFacilityAmendmentSchema>;

export const validatePostFacilityAmendmentPayload = validateSchema(PostFacilityAmendmentSchema);
