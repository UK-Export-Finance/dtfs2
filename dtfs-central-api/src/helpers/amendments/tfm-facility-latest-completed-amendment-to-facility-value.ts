import { TfmFacility } from '@ukef/dtfs2-common';
import orderBy from 'lodash.orderby';
import { filterCompletedAmendments } from './filter-completed-amendments';

/**
 * Get the latest completed facility value amendment
 * @param tfmFacility - The tfm facility
 * @returns The latest completed facility value amendment or null if there aren't any
 */
export const getLatestCompletedAmendmentToFacilityValue = (tfmFacility: TfmFacility): number | null => {
  const { amendments } = tfmFacility;
  if (!amendments) {
    return null;
  }

  const completedAmendments = filterCompletedAmendments(amendments);

  const latestAmendmentWithFacilityValue = orderBy(completedAmendments, ['updatedAt'], ['desc']).find(({ value }) => value !== undefined && value !== null);

  if (latestAmendmentWithFacilityValue?.value !== undefined) {
    return latestAmendmentWithFacilityValue.value;
  }

  return null;
};
