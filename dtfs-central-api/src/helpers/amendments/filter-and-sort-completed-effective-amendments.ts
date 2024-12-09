import { AMENDMENT_STATUS, isValidDate, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { isBefore } from 'date-fns';
import { orderBy } from 'lodash';
import { convertTimestampToDate } from '../convert-timestamp-to-date';

/**
 * Filters amendments to only those which are completed
 * and effective from or before the given date.
 *
 * Sorts the filtered amendments by effective date descending.
 *
 * If no effective date is present then uses the updatedAt
 * date in it's place as a fallback.
 * @param tfmFacilityAmendments - amendments to filter
 * @param latestEffectiveDate - The latest effective date to consider
 * @returns completed amendments
 */
export const filterAndSortCompletedEffectiveAmendments = (tfmFacilityAmendments: TfmFacilityAmendment[], latestEffectiveDate: Date): TfmFacilityAmendment[] => {
  const filteredAmendments = tfmFacilityAmendments.filter(({ status, effectiveDate, updatedAt, amendmentId }) => {
    if (status !== AMENDMENT_STATUS.COMPLETED) {
      return false;
    }

    const dateToUse = effectiveDate ? convertTimestampToDate(effectiveDate) : convertTimestampToDate(updatedAt);

    if (!isValidDate(dateToUse)) {
      const invalidField = effectiveDate ? 'effectiveDate' : 'updatedAt';
      const message = `Error filtering amendments - Tfm facility amendment with ID ${amendmentId.toString()} has an invalid ${invalidField}`;
      console.error(message);
      throw new Error(message);
    }

    return isBefore(dateToUse, latestEffectiveDate);
  });

  return orderBy(
    filteredAmendments,
    [({ effectiveDate, updatedAt }) => (effectiveDate ? convertTimestampToDate(effectiveDate) : convertTimestampToDate(updatedAt))],
    ['desc'],
  );
};
