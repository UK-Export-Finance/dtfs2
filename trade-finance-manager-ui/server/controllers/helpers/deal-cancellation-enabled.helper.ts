import {
  DEAL_SUBMISSION_TYPE,
  DealSubmissionType,
  TEAM_IDS,
  TFM_DEAL_CANCELLATION_STATUS,
  TfmDealCancellationStatus,
  TfmSessionUser,
} from '@ukef/dtfs2-common';
import { userIsInTeam } from '@tfm-ui/helpers/user';

const { AIN, MIN } = DEAL_SUBMISSION_TYPE;
/**
 * Checks if the deal submission type can be cancelled
 * @param submissionType - the deal submission type
 * @returns true if the deal is AIN or MIN
 */
export const canSubmissionTypeBeCancelled = (submissionType: DealSubmissionType | null): boolean => {
  return submissionType === AIN || submissionType === MIN;
};

/**
 * Checks if user is allowed to cancel a deal
 * @param user - the session user
 * @returns true or false depending on the feature flag, submission type and user type
 */
export const isUserAllowedToCancelDeal = (user: TfmSessionUser): boolean => {
  const isUserAllowedToCancelDeal = userIsInTeam(user, [TEAM_IDS.PIM]);

  return isUserAllowedToCancelDeal;
};

/**
 * Checks if a deal can be cancelled; if it has already been cancelled then this returns false
 * @param cancellationStatus - optional current deal cancellation status
 * @returns true or false depending on if the deal has already been cancelled
 */
export const canDealBeCancelled = (cancellationStatus?: TfmDealCancellationStatus): boolean => {
  const isCompleted = cancellationStatus === TFM_DEAL_CANCELLATION_STATUS.COMPLETED;
  const isPending = cancellationStatus === TFM_DEAL_CANCELLATION_STATUS.PENDING;

  const canBeCancelled = !isCompleted && !isPending;

  return canBeCancelled;
};

/**
 * Checks if a deal cancellation is in draft
 * @param cancellationStatus - optional current deal cancellation status
 * @returns true or false depending on if the cancellation status is Draft
 */
export const isDealCancellationInDraft = (cancellationStatus?: TfmDealCancellationStatus): boolean => {
  return cancellationStatus === TFM_DEAL_CANCELLATION_STATUS.DRAFT;
};
