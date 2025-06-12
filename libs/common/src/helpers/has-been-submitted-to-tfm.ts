import { Deal } from '../types';
import { DEAL_TYPE } from '../constants';

/**
 * Determines whether a deal has been submitted to TFM based on its submission count property value.
 *
 * For GEF deals, uses the `submissionCount` property directly from the deal.
 * For other deal types i.e. BSS/EWCS, uses the `submissionCount` from the deal's `details`.
 * Returns `true` if the submission count is greater than 0, otherwise `false`.
 *
 * @param deal - The deal object to check submission status for.
 * @returns `true` if the deal has been submitted to TFM, otherwise `false`.
 */
export const hasBeenSubmittedToTfm = (deal: Deal): boolean => {
  // Ascertain submission count by deal type
  const isGef = deal.dealType === DEAL_TYPE.GEF;
  const submissionCount = isGef ? deal.submissionCount : deal.details.submissionCount;

  /**
   * If the deal submission count is 0 (with maker or checker).
   * Then return false otherwise true.
   */
  return Boolean(submissionCount);
};
