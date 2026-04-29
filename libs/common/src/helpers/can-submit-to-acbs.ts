import { AMENDMENT_TYPES, AMENDMENT_BANK_DECISION, TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS } from '../constants';
import { PortalFacilityAmendmentWithUkefId, TfmFacilityAmendmentWithUkefId } from '../types';
import { isAmendmentDeclined } from './is-amendment-declined';

/**
 * Determines if an amendment can be sent to ACBS based on its type, status, user involvement, and amendment details.
 *
 * For TFM amendments:
 * - Requires the amendment to be marked as `Completed`.
 * - Checks for PIM user involvement.
 * - If the amendment is manual (requires UKEF approval and has a bank decision), verifies the bank decision is submitted and accepted.
 *
 * For Portal amendments:
 * - Requires the amendment to be marked as `Acknowledged`.
 * - Checks for Checker user involvement.
 *
 * In both cases, ensures at least one attribute (cover end date or facility value) has been amended.
 *
 * If the amendment update is part of a task update, it should not be sent to ACBS, hence the `isTaskUpdate` flag is used to prevent that.
 *
 * @param amendment - The amendment object, either PortalFacilityAmendmentWithUkefId or TfmFacilityAmendmentWithUkefId.
 * @param isTaskUpdate - Optional flag indicating if the amendment update is part of a task update.
 * @returns `true` if the amendment meets all criteria to be sent to ACBS, otherwise `false`.
 */
export const canSendToAcbs = (amendment: PortalFacilityAmendmentWithUkefId | TfmFacilityAmendmentWithUkefId, isTaskUpdate = false) => {
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

  // Manual amendment verification - TFM amendments only
  const isAmendmentManual = isPortalAmendment ? false : Boolean(amendment.requireUkefApproval) && Boolean(amendment.bankDecision);

  // Manual amendment - TFM only
  if (isAmendmentManual && !isPortalAmendment) {
    // Bank Decision
    const submitted = amendment.bankDecision?.submitted;
    const decision = amendment.bankDecision?.decision;

    // Bank has accepted the UW decision
    const proceed = decision === AMENDMENT_BANK_DECISION.PROCEED;

    return hasBeenAmended && hasBeenSubmittedToUkef && hasUser && submitted && proceed && !isAmendmentDeclined(amendment) && !isTaskUpdate;
  }

  // Automatic amendment
  return hasBeenAmended && hasBeenSubmittedToUkef && hasUser && !isTaskUpdate;
};
