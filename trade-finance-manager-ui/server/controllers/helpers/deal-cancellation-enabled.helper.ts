import {
  DEAL_SUBMISSION_TYPE,
  DealSubmissionType,
  isTfmDealCancellationFeatureFlagEnabled,
  TEAM_IDS,
  TFM_DEAL_CANCELLATION_STATUS,
  TfmDealCancellationStatus,
} from '@ukef/dtfs2-common';
import { userIsInTeam } from '../../helpers/user';
import { TfmSessionUser } from '../../types/tfm-session-user';

const { AIN, MIN } = DEAL_SUBMISSION_TYPE;
/**
 * Checks if the deal submission type can be cancelled
 * @param submissionType - the deal submission type
 * @returns true if the deal is AIN or MIN
 */
export const canSubmissionTypeBeCancelled = (submissionType: DealSubmissionType): boolean => {
  return submissionType === AIN || submissionType === MIN;
};

/**
 * Checks if deal cancellation is enabled for a deal and user type
 * @param submissionType - the deal submission type
 * @param user - the session user
 * @returns true or false depending on the feature flag, submission type and user type
 */
export const isDealCancellationEnabled = (submissionType: DealSubmissionType, user: TfmSessionUser): boolean => {
  const isUserAllowedToCancelDeal = userIsInTeam(user, [TEAM_IDS.PIM]);
  const isDealCancellationFeatureFlagEnabled = isTfmDealCancellationFeatureFlagEnabled();
  const isAcceptableSubmissionType = canSubmissionTypeBeCancelled(submissionType);

  return isUserAllowedToCancelDeal && isDealCancellationFeatureFlagEnabled && isAcceptableSubmissionType;
};

/**
 * Checks if a deal can be cancelled; if it has already been cancelled then this returns false
 * @param cancellationStatus - optional current deal cancellation status
 * @returns true or false depending on if the deal has already been cancelled
 */
export const canDealStillBeCancelled = (cancellationStatus?: TfmDealCancellationStatus): boolean => {
  const isDealAlreadyCancelled = cancellationStatus === TFM_DEAL_CANCELLATION_STATUS.COMPLETED || cancellationStatus === TFM_DEAL_CANCELLATION_STATUS.SCHEDULED;

  return !isDealAlreadyCancelled;
};

/**
 * Checks if a deal cancellation is in draft
 * @param cancellationStatus - optional current deal cancellation status
 * @returns true or false depending on if the cancellation status is Draft
 */
export const isDealCancellationInDraft = (cancellationStatus?: TfmDealCancellationStatus): boolean => {
  return cancellationStatus === TFM_DEAL_CANCELLATION_STATUS.DRAFT;
};
