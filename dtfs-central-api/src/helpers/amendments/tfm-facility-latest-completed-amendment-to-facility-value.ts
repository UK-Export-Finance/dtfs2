import { TfmFacility } from '@ukef/dtfs2-common';
import orderBy from 'lodash.orderby';
import { filterCompletedAmendments } from './filter-completed-amendments';

/**
 * Get the latest completed facility value amendment
 * @param tfmFacility - The tfm facility
 * @returns The latest completed facility value amendment
 */
export const getLatestCompletedAmendmentToFacilityValue = (tfmFacility: TfmFacility): number | undefined => {
  const { amendments } = tfmFacility;
  if (!amendments) {
    return undefined;
  }

  const completedAmendments = filterCompletedAmendments(amendments);

  const latestAmendmentWithFacilityValue = orderBy(completedAmendments, ['updatedAt'], ['desc']).find(({ value }) => value);

  return latestAmendmentWithFacilityValue?.value ?? undefined;
};
