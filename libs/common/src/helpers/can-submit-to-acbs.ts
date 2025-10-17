import { AMENDMENT_BANK_DECISION, TFM_AMENDMENT_STATUS } from '../constants';
import { TfmFacilityAmendmentWithUkefId } from '../types';
import { amendmentDeclined } from './is-amendment-declined';

/**
 * Determines if an amendment can be sent to ACBS based on its properties.
 *
 * The function checks the following conditions:
 * - At least one of the amendment attributes (`changeCoverEndDate` or `changeFacilityValue`) has been amended.
 * - The amendment status is marked as `COMPLETED`.
 * - The amendment has been submitted by the PIM team (`submittedByPim`).
 * - For manual amendments (where `requireUkefApproval` and `bankDecision` are truthy):
 *   - The bank decision has been submitted.
 *   - The bank decision is to proceed (`PROCEED`).
 *   - The amendment has not been declined (`amendmentDeclined` returns false).
 * - For automatic amendments, only the first three conditions are checked.
 *
 * @param amendment - The amendment object to evaluate.
 * @returns `true` if the amendment can be sent to ACBS, otherwise `false`.
 */
export const canSendToAcbs = (amendment: TfmFacilityAmendmentWithUkefId) => {
  // Ensure at least one of the attribute has been amended
  const hasBeenAmended = amendment.changeCoverEndDate || amendment.changeFacilityValue;
  // Amendment status is marked as `Completed`
  const completed = amendment.status === TFM_AMENDMENT_STATUS.COMPLETED;
  // Amendment has been submitted by PIM team
  const pim = amendment.submittedByPim;
  // Manual amendment verification
  const manual = Boolean(amendment.requireUkefApproval) && Boolean(amendment.bankDecision);

  // Manual amendment
  if (manual) {
    // Bank Decision
    const submitted = amendment.bankDecision?.submitted;
    const decision = amendment.bankDecision?.decision;

    // Bank has accepted the UW decision
    const proceed = decision === AMENDMENT_BANK_DECISION.PROCEED;

    return hasBeenAmended && completed && pim && submitted && proceed && !amendmentDeclined(amendment);
  }

  // Automatic amendment
  return hasBeenAmended && completed && pim;
};
