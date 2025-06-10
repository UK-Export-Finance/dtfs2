import z from 'zod';
import { createValidationMiddlewareForSchema, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { AuditDetailsSchema } from './schemas';

const PatchPortalFacilityAmendmentStatusSchema = z.object({
  auditDetails: AuditDetailsSchema,
  newStatus: z.enum([PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL, PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED]),
  makersEmail: z.string(),
  checkersEmail: z.string(),
  emailVariables: z.object({
    exporterName: z.string(),
    bankInternalRefName: z.string(),
    ukefDealId: z.string(),
    ukefFacilityId: z.string(),
    makersName: z.string().optional(),
    checkersName: z.string(),
    dateSubmittedByMaker: z.string().optional(),
    dateEffectiveFrom: z.string(),
    newCoverEndDate: z.string(),
    newFacilityEndDate: z.string(),
    newFacilityValue: z.string(),
    portalUrl: z.string().optional(),
    makersEmail: z.string().optional(),
    checkersEmail: z.string().optional(),
  }),
});

export type PatchPortalFacilityAmendmentStatusPayload = z.infer<typeof PatchPortalFacilityAmendmentStatusSchema>;

export const validatePatchPortalFacilityAmendmentStatusPayload = createValidationMiddlewareForSchema(PatchPortalFacilityAmendmentStatusSchema);
