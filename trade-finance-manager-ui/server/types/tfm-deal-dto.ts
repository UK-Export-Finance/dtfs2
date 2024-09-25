import { DealSubmissionType } from '@ukef/dtfs2-common';

/**
 * Data Transfer Object sent from the trade-finance-manager-api endpoint /v1/deals/:id
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmDealDto = { dealSnapshot: { details: { ukefDealId: string }; submissionType: DealSubmissionType } };
