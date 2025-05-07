import { createValidationMiddlewareForSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import z from 'zod';

const PatchPortalFacilityAmendmentStatusSchema = z.object({
  newStatus: z.enum([PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL, PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED]),
  makersEmail: z.string(),
  checkersEmail: z.string(),
  emailVariables: z.object({
    exporterName: z.string(),
    bankInternalRefName: z.string(),
    ukefDealId: z.string(),
    ukefFacilityId: z.string(),
    makersName: z.string(),
    checkersName: z.string(),
    dateSubmittedByMaker: z.string(),
    dateEffectiveFrom: z.string(),
    newCoverEndDate: z.string(),
    newFacilityEndDate: z.string(),
    newFacilityValue: z.string(),
    portalUrl: z.string(),
    makersEmail: z.string(),
  }),
});

export type PatchPortalFacilityAmendmentStatusPayload = z.infer<typeof PatchPortalFacilityAmendmentStatusSchema>;

export const validatePatchPortalFacilityAmendmentStatusPayload = createValidationMiddlewareForSchema(PatchPortalFacilityAmendmentStatusSchema);
