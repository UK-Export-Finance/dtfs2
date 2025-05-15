import { validateSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import z from 'zod';

/**
 * Schema for validating submit amendment payload.
 */
const PatchPortalFacilitySubmitAmendmentSchema = z.object({
  newStatus: z.enum([PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED]),
  referenceNumber: z.string(),
});

export type PatchPortalFacilitySubmitAmendmentPayload = z.infer<typeof PatchPortalFacilitySubmitAmendmentSchema>;

export const validatePatchPortalFacilitySubmitAmendmentPayload = validateSchema(PatchPortalFacilitySubmitAmendmentSchema);
