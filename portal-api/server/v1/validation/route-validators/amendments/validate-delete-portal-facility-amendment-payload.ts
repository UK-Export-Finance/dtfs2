import { validateSchema } from '@ukef/dtfs2-common';
import zod from 'zod';

const DeletePortalFacilityAmendmentSchema = zod.object({
  makersEmail: zod.string(),
  checkersEmail: zod.string(),
  emailVariables: zod.object({
    exporterName: zod.string(),
    bankInternalRefName: zod.string(),
    ukefDealId: zod.string(),
    ukefFacilityId: zod.string(),
    makersName: zod.string(),
    checkersName: zod.string(),
    dateEffectiveFrom: zod.string(),
    newCoverEndDate: zod.string(),
    newFacilityEndDate: zod.string(),
    newFacilityValue: zod.string(),
  }),
});

export type DeletePortalFacilityAmendmentPayload = zod.infer<typeof DeletePortalFacilityAmendmentSchema>;

export const validateDeletePortalFacilityAmendmentPayload = validateSchema(DeletePortalFacilityAmendmentSchema);
