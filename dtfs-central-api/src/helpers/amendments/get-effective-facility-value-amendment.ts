import { TfmFacility } from '@ukef/dtfs2-common';
import { filterAndSortCompletedEffectiveAmendments } from './filter-and-sort-completed-effective-amendments';

/**
 * Get the completed amendment facility value that is effective
 * on the effective at date if there are any.
 *
 * The effective amendment at a given date is the amendment which:
 * - Includes a change to facility value
 * - Is completed
 * - Has the latest effective date before the effective at date
 * @param tfmFacility - The tfm facility
 * @param effectiveAtDate - The date to find the effective amendment for
 * @returns The effective amendment to facility value if there is one
 */
export const getEffectiveFacilityValueAmendment = (tfmFacility: TfmFacility, effectiveAtDate: Date): number | null => {
  const { amendments } = tfmFacility;
  if (!amendments) {
    return null;
  }

  const completedEffectiveAmendments = filterAndSortCompletedEffectiveAmendments(amendments, effectiveAtDate);

  const latestAmendmentWithFacilityValue = completedEffectiveAmendments.find(({ value }) => value !== undefined && value !== null);

  if (latestAmendmentWithFacilityValue?.value !== undefined) {
    return latestAmendmentWithFacilityValue.value;
  }

  return null;
};
