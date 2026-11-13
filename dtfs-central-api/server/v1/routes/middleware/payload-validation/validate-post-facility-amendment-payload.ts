import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

const PostFacilityAmendmentSchema = zod.object({
  auditDetails: AuditDetailsSchema,
});

export type PostFacilityAmendmentPayload = zod.infer<typeof PostFacilityAmendmentSchema>;

export const validatePostFacilityAmendmentPayload = validateSchema(PostFacilityAmendmentSchema);
