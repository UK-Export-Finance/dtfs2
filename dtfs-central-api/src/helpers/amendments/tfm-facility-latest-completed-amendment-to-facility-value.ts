import { TfmFacility } from '@ukef/dtfs2-common';
import orderBy from 'lodash.orderby';
import { getCompletedAmendments } from './completed-amendments';

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

  const completedAmendments = getCompletedAmendments(amendments);

  const latestAmendmentWithDefinedFacilityValue = orderBy(completedAmendments, ['updatedAt'], ['desc']).find(({ value }) => value);

  return latestAmendmentWithDefinedFacilityValue?.value ?? undefined;
};
