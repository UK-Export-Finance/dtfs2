import {
  DEAL_SUBMISSION_TYPE,
  DealSubmissionType,
  isTfmDealCancellationFeatureFlagEnabled,
  TEAM_IDS,
  TFM_DEAL_CANCELLATION_STATUS,
  TfmDealCancellationStatus,
  TfmSessionUser,
} from '@ukef/dtfs2-common';
import { userIsInTeam } from '../../helpers/user';

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
 * Checks if deal cancellation is enabled for a deal
 * @param submissionType the deal submission type
 * @returns true or false depending on the feature flag & submission type
 */
export const isDealCancellationEnabled = (submissionType: DealSubmissionType | null): boolean => {
  const isDealCancellationFeatureFlagEnabled = isTfmDealCancellationFeatureFlagEnabled();
  const isAcceptableSubmissionType = canSubmissionTypeBeCancelled(submissionType);

  return isDealCancellationFeatureFlagEnabled && isAcceptableSubmissionType;
};

/**
 * Checks if deal cancellation is enabled for a deal and user type
 * @param submissionType - the deal submission type
 * @param user - the session user
 * @returns true or false depending on the feature flag, submission type and user type
 */
export const isDealCancellationEnabledForUser = (submissionType: DealSubmissionType, user: TfmSessionUser): boolean => {
  const isUserAllowedToCancelDeal = userIsInTeam(user, [TEAM_IDS.PIM]);
  const dealCanBeCancelled = isDealCancellationEnabled(submissionType);

  return isUserAllowedToCancelDeal && dealCanBeCancelled;
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
