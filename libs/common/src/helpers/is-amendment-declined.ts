import { UNDERWRITER_MANAGER_DECISIONS } from '../constants';
import { TfmFacilityAmendmentWithUkefId } from '../types';

/**
 * Determines if an amendment has been declined based on the underwriter manager's decision.
 *
 * For dual amendment requests (both `changeFacilityValue` and `changeCoverEndDate` are true),
 * the amendment is considered declined only if both `value` and `coverEndDate` decisions are declined.
 * For single amendment requests, the amendment is considered declined if either decision is declined.
 *
 * @param amendment - The amendment object containing decision details.
 * @returns `true` if the amendment is declined according to the decision logic, otherwise `false`.
 */
export const amendmentDeclined = (amendment: TfmFacilityAmendmentWithUkefId) => {
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
};
