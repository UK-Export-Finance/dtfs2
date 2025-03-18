import { createValidationMiddlewareForSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import z from 'zod';

const PatchPortalFacilityAmendmentStatusSchema = z.object({
  newStatus: z.enum([PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL]),
  exporterName: z.string(),
  bankInternalRefName: z.string(),
  ukefDealId: z.string(),
  ukefFacilityId: z.string(),
  sendToEmailAddress: z.string(),
  recipientName: z.string(),
  dateEffectiveFrom: z.string(),
  newCoverEndDate: z.string(),
  newFacilityEndDate: z.string(),
  newFacilityValue: z.string(),
});

export type PatchPortalFacilityAmendmentStatusPayload = z.infer<typeof PatchPortalFacilityAmendmentStatusSchema>;

export const validatePatchPortalFacilityAmendmentStatusPayload = createValidationMiddlewareForSchema(PatchPortalFacilityAmendmentStatusSchema);
