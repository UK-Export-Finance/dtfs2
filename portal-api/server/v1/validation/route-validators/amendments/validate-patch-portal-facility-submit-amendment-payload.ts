import { validateSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import zod from 'zod';

/**
 * Schema for validating submit amendment payload.
 */
const PatchPortalFacilitySubmitAmendmentSchema = zod.object({
  newStatus: zod.enum([PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED]),
  referenceNumber: zod.string(),
  makersEmail: zod.string(),
  checkersEmail: zod.string(),
  pimEmail: zod.string(),
  emailVariables: zod.object({
    exporterName: zod.string(),
    bankInternalRefName: zod.string(),
    ukefDealId: zod.string(),
    ukefFacilityId: zod.string(),
    makersName: zod.string(),
    makersEmail: zod.string(),
    checkersName: zod.string(),
    dateEffectiveFrom: zod.string(),
    newCoverEndDate: zod.string(),
    newFacilityEndDate: zod.string(),
    newFacilityValue: zod.string(),
    bankName: zod.string(),
    eligibilityCriteria: zod.string(),
    referenceNumber: zod.string(),
  }),
  requestDate: zod.number(),
  bankId: zod.string(),
  bankName: zod.string(),
});

export type PatchPortalFacilitySubmitAmendmentPayload = zod.infer<typeof PatchPortalFacilitySubmitAmendmentSchema>;

export const validatePatchPortalFacilitySubmitAmendmentPayload = validateSchema(PatchPortalFacilitySubmitAmendmentSchema);
