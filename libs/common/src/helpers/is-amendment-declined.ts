import { AMENDMENT_TYPES, UNDERWRITER_MANAGER_DECISIONS } from '../constants';
import { PortalFacilityAmendmentWithUkefId, TfmFacilityAmendmentWithUkefId } from '../types';

/**
 * Determines if a given amendment has been declined by UKEF.
 *
 * For TFM amendments (manual amendments), checks the UKEF decision for both
 * facility value and cover end date changes:
 * - If both `changeFacilityValue` and `changeCoverEndDate` are requested,
 *   returns `true` only if both are declined.
 * - If only one is requested, returns `true` if either is declined.
 *
 * For non-TFM amendments, always returns `false`.
 *
 * @param amendment - The amendment object, which can be either a Portal or TFM amendment with a UKEF ID.
 * @returns `true` if the amendment is declined according to UKEF decision, otherwise `false`.
 */
export const isAmendmentDeclined = (amendment: PortalFacilityAmendmentWithUkefId | TfmFacilityAmendmentWithUkefId) => {
  const isTfmAmendment = amendment.type === AMENDMENT_TYPES.TFM;

  /**
   * UKEF decision can only be applied to manual amendment.
   * At the time of writing this comment only TFM amendments
   * support manual amendments
   */
  if (isTfmAmendment) {
    const { changeFacilityValue, changeCoverEndDate } = amendment;
    const value = amendment.ukefDecision?.value;
    const coverEndDate = amendment.ukefDecision?.coverEndDate;

    const { DECLINED } = UNDERWRITER_MANAGER_DECISIONS;

    // Ensure not all of the amendment requests are declined

    // Dual amendment request
    if (changeFacilityValue && changeCoverEndDate) {
      return value === DECLINED && coverEndDate === DECLINED;
    }
    // Single amendment request
    return value === DECLINED || coverEndDate === DECLINED;
  }

  return false;
};
