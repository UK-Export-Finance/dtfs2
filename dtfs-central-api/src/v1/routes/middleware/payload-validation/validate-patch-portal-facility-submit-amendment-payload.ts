import z from 'zod';
import { validateSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

/**
 * Schema for validating submit amendment payload.
 */
const PatchPortalFacilitySubmitAmendmentSchema = z.object({
  auditDetails: AuditDetailsSchema,
  newStatus: z.enum([PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED]),
  referenceNumber: z.string(),
  makersEmail: z.string(),
  checkersEmail: z.string(),
  pimEmail: z.string(),
  emailVariables: z.object({
    exporterName: z.string(),
    bankInternalRefName: z.string(),
    ukefDealId: z.string(),
    ukefFacilityId: z.string(),
    makersName: z.string(),
    makersEmail: z.string(),
    checkersName: z.string(),
    dateEffectiveFrom: z.string(),
    newCoverEndDate: z.string(),
    newFacilityEndDate: z.string(),
    newFacilityValue: z.string(),
    bankName: z.string(),
    eligibilityCriteria: z.string(),
    referenceNumber: z.string(),
  }),
  bankId: z.string(),
  bankName: z.string(),
});

export type PatchPortalFacilitySubmitAmendmentPayload = z.infer<typeof PatchPortalFacilitySubmitAmendmentSchema>;

export const validatePatchPortalFacilitySubmitAmendmentPayload = validateSchema(PatchPortalFacilitySubmitAmendmentSchema);
