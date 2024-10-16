import { TfmFacility } from '@ukef/dtfs2-common';
import { convertTimestampToDate } from '../convert-timestamp-to-date';
import { filterAndSortCompletedEffectiveAmendments } from './filter-and-sort-completed-effective-amendments';

/**
 * Get the completed amendment cover end date that is effective
 * on the effective at date if there are any.
 *
 * The effective amendment at a given date is the amendment which:
 * - Includes a change to cover end date
 * - Is completed
 * - Has the latest effective date before the effective at date
 * @param tfmFacility - The tfm facility
 * @param effectiveAtDate - The date to find the effective amendment for
 * @returns The effective amendment cover end date if there is one
 */
export const getEffectiveCoverEndDateAmendment = (tfmFacility: TfmFacility, effectiveAtDate: Date): Date | null => {
  const { amendments } = tfmFacility;
  if (!amendments) {
    return null;
  }

  const completedEffectiveAmendments = filterAndSortCompletedEffectiveAmendments(amendments, effectiveAtDate);

  const effectiveAmendmentWithCoverEndDate = completedEffectiveAmendments.find(({ coverEndDate }) => coverEndDate);

  const effectiveCoverEndDateAmendment = effectiveAmendmentWithCoverEndDate?.coverEndDate ?? null;
  if (!effectiveCoverEndDateAmendment) {
    return null;
  }
  return convertTimestampToDate(effectiveCoverEndDateAmendment);
};
