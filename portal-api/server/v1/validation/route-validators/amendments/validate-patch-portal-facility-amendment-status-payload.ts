import { validateSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import zod from 'zod';

const PatchPortalFacilityAmendmentStatusSchema = zod.object({
  newStatus: zod.enum([PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL, PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED]),
  makersEmail: zod.string(),
  checkersEmail: zod.string(),
  emailVariables: zod.object({
    exporterName: zod.string(),
    bankInternalRefName: zod.string(),
    ukefDealId: zod.string(),
    ukefFacilityId: zod.string(),
    makersName: zod.string(),
    checkersName: zod.string(),
    dateSubmittedByMaker: zod.string().optional(),
    dateEffectiveFrom: zod.string(),
    newCoverEndDate: zod.string(),
    newFacilityEndDate: zod.string(),
    newFacilityValue: zod.string(),
    portalUrl: zod.string().optional(),
    makersEmail: zod.string().optional(),
    checkersEmail: zod.string().optional(),
  }),
});

export type PatchPortalFacilityAmendmentStatusPayload = zod.infer<typeof PatchPortalFacilityAmendmentStatusSchema>;

export const validatePatchPortalFacilityAmendmentStatusPayload = validateSchema(PatchPortalFacilityAmendmentStatusSchema);
