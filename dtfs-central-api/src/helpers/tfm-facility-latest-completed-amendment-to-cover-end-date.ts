import { TfmFacility, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import orderBy from 'lodash.orderby';
import { convertTimestampToDate } from './convert-timestamp-to-date';

const getCompletedAmendments = (tfmFacilityAmendment: TfmFacilityAmendment[]): TfmFacilityAmendment[] =>
  tfmFacilityAmendment.filter(({ status }) => status === 'Completed');

/**
 * Get the latest completed amendment cover end date
 * @param tfmFacility - The tfm facility
 * @returns The latest completed amendment cover end date
 */
export const getLatestCompletedAmendmentCoverEndDate = (tfmFacility: TfmFacility): Date | undefined => {
  const { amendments } = tfmFacility;
  if (!amendments) {
    return undefined;
  }

  const completedAmendments = getCompletedAmendments(amendments);

  const latestAmendmentWithDefinedCoverEndDate = orderBy(completedAmendments, ['updatedAt'], ['desc']).find(({ coverEndDate }) => coverEndDate);

  const latestCoverEndDate = latestAmendmentWithDefinedCoverEndDate?.coverEndDate ?? undefined;
  if (!latestCoverEndDate) {
    return undefined;
  }
  return convertTimestampToDate(latestCoverEndDate);
};
