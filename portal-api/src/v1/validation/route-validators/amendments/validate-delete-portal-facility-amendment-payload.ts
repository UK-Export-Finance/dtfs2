import { validateSchema } from '@ukef/dtfs2-common';
import z from 'zod';

const DeletePortalFacilityAmendmentSchema = z.object({
  makersEmail: z.string(),
  checkersEmail: z.string(),
  emailVariables: z.object({
    exporterName: z.string(),
    bankInternalRefName: z.string(),
    ukefDealId: z.string(),
    ukefFacilityId: z.string(),
    makersName: z.string(),
    checkersName: z.string(),
    dateEffectiveFrom: z.string(),
    newCoverEndDate: z.string(),
    newFacilityEndDate: z.string(),
    newFacilityValue: z.string(),
  }),
});

export type DeletePortalFacilityAmendmentPayload = z.infer<typeof DeletePortalFacilityAmendmentSchema>;

export const validateDeletePortalFacilityAmendmentSchemaPayload = validateSchema(DeletePortalFacilityAmendmentSchema);
