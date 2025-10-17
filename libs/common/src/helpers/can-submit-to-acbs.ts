import { AMENDMENT_TYPES, AMENDMENT_BANK_DECISION, TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS } from '../constants';
import { TfmFacilityAmendmentWithUkefId } from '../types';
import { amendmentDeclined } from './is-amendment-declined';

/**
 * Determines if an amendment can be sent to ACBS based on its type, status, user involvement, and amendment details.
 *
 * The function checks the following conditions:
 * - The amendment type (Portal or TFM).
 * - At least one attribute (cover end date or facility value) has been amended.
 * - The amendment status is appropriate for its type (Acknowledged for Portal, Completed for TFM).
 * - The amendment has the required user involvement (created by for Portal, submitted by PIM for TFM).
 * - For manual amendments (TFM only), verifies bank decision has been submitted and accepted, and the amendment has not been declined.
 *
 * @param amendment - The amendment object containing all relevant details for validation.
 * @returns `true` if the amendment meets all criteria to be sent to ACBS, otherwise `false`.
 */
export const canSendToAcbs = (amendment: TfmFacilityAmendmentWithUkefId) => {
  // Amendment type
  const isPortalAmendment = amendment.type === AMENDMENT_TYPES.PORTAL;

  // Ensure at least one of the attribute has been amended
  const hasBeenAmended = amendment.changeCoverEndDate || amendment.changeFacilityValue;

  /**
   * Amendment status is marked as `Completed` for `TFM` type amendment
   * Amendment status is marked as `Acknowledged` for `Portal` type amendment
   */
  const hasBeenSubmittedToUkef = isPortalAmendment
    ? amendment.status === PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED
    : amendment.status === TFM_AMENDMENT_STATUS.COMPLETED;

  /**
   * Amendment type `TFM`, check for PIM.
   * Amendment type `Portal`, check for Checker.
   */
  const hasUser = isPortalAmendment ? Boolean(amendment.createdBy?.username) : amendment.submittedByPim;

  // Manual amendment verification
  const isAmendmentManual = Boolean(amendment.requireUkefApproval) && Boolean(amendment.bankDecision);

  // Manual amendment - TFM only
  if (isAmendmentManual && !isPortalAmendment) {
    // Bank Decision
    const submitted = amendment.bankDecision?.submitted;
    const decision = amendment.bankDecision?.decision;

    // Bank has accepted the UW decision
    const proceed = decision === AMENDMENT_BANK_DECISION.PROCEED;

    return hasBeenAmended && hasBeenSubmittedToUkef && hasUser && submitted && proceed && !amendmentDeclined(amendment);
  }

  // Automatic amendment
  return hasBeenAmended && hasBeenSubmittedToUkef && hasUser;
};
