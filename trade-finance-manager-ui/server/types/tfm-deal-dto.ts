import { DealSubmissionType } from '@ukef/dtfs2-common';

export type TfmDealDto = { dealSnapshot: { details: { ukefDealId: string }; submissionType: DealSubmissionType } };
