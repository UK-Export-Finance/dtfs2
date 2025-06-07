import z from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

const DeletePortalFacilityAmendmentSchema = z.object({
  auditDetails: AuditDetailsSchema,
});

export type DeletePortalFacilityAmendmentPayload = z.infer<typeof DeletePortalFacilityAmendmentSchema>;

export const validateDeletePortalFacilityAmendmentPayload = validateSchema(DeletePortalFacilityAmendmentSchema);
