import { AMENDMENT_STATUS, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { addDays, subDays } from 'date-fns';
import { aCompletedTfmFacilityAmendment, aTfmFacilityAmendment } from '../../../test-helpers';
import { filterAndSortCompletedEffectiveAmendments } from './filter-and-sort-completed-effective-amendments';

describe('filter-and-sort-completed-effective-amendments', () => {
  describe('filterAndSortCompletedEffectiveAmendments', () => {
    const latestEffectiveDate = new Date('2024-02-28');

    const oneDayBeforeLatestEffectiveDateInMilliseconds = subDays(latestEffectiveDate, 1).getTime();
    const oneDayBeforeLatestEffectiveDateInSeconds = Math.round(oneDayBeforeLatestEffectiveDateInMilliseconds / 1000);

    const oneDayAfterLatestEffectiveDateInMilliseconds = addDays(latestEffectiveDate, 1).getTime();
    const oneDayAfterLatestEffectiveDateInSeconds = Math.round(oneDayAfterLatestEffectiveDateInMilliseconds / 1000);

    const twoDaysBeforeLatestEffectiveDateInMilliseconds = subDays(latestEffectiveDate, 2).getTime();
    const twoDaysBeforeLatestEffectiveDateInSeconds = Math.round(twoDaysBeforeLatestEffectiveDateInMilliseconds / 1000);

    const threeDaysBeforeLatestEffectiveDateInMilliseconds = subDays(latestEffectiveDate, 3).getTime();
    const threeDaysBeforeLatestEffectiveDateInSeconds = Math.round(threeDaysBeforeLatestEffectiveDateInMilliseconds / 1000);

    it('should filter out all amendments which are not completed', () => {
      // Arrange
      const now = new Date();
      const beforeNow = subDays(now, 1);

      const aCompletedAmendment = { ...aTfmFacilityAmendment(), status: AMENDMENT_STATUS.COMPLETED, effectiveDate: beforeNow.getTime() };
      const amendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), status: AMENDMENT_STATUS.IN_PROGRESS, effectiveDate: beforeNow.getTime() },
        { ...aTfmFacilityAmendment(), status: AMENDMENT_STATUS.NOT_STARTED, effectiveDate: beforeNow.getTime() },
        aCompletedAmendment,
      ];

      // Act
      const result = filterAndSortCompletedEffectiveAmendments(amendments, now);

      // Assert
      expect(result).toEqual([aCompletedAmendment]);
    });

    it.each`
      effectiveDateType | beforeLatestEffectiveDate                        | afterLatestEffectiveDate
      ${'milliseconds'} | ${oneDayBeforeLatestEffectiveDateInMilliseconds} | ${oneDayAfterLatestEffectiveDateInMilliseconds}
      ${'seconds'}      | ${oneDayBeforeLatestEffectiveDateInSeconds}      | ${oneDayAfterLatestEffectiveDateInSeconds}
    `(
      'should filter out all amendments with effective date after latestEffectiveDate (effective date stored in $effectiveDateType)',
      ({ beforeLatestEffectiveDate, afterLatestEffectiveDate }: { beforeLatestEffectiveDate: number; afterLatestEffectiveDate: number }) => {
        // Arrange
        const amendmentEffectiveBeforeLatestEffectiveDate = {
          ...aCompletedTfmFacilityAmendment(),
          effectiveDate: beforeLatestEffectiveDate,
        };

        const amendmentEffectiveAfterLatestEffectiveDate = {
          ...aCompletedTfmFacilityAmendment(),
          effectiveDate: afterLatestEffectiveDate,
        };

        const amendments: TfmFacilityAmendment[] = [amendmentEffectiveBeforeLatestEffectiveDate, amendmentEffectiveAfterLatestEffectiveDate];

        // Act
        const result = filterAndSortCompletedEffectiveAmendments(amendments, latestEffectiveDate);

        // Assert
        expect(result).toEqual([amendmentEffectiveBeforeLatestEffectiveDate]);
      },
    );

    it.each`
      effectiveDateType | beforeLatestEffectiveDate                        | afterLatestEffectiveDate
      ${'milliseconds'} | ${oneDayBeforeLatestEffectiveDateInMilliseconds} | ${oneDayAfterLatestEffectiveDateInMilliseconds}
      ${'seconds'}      | ${oneDayBeforeLatestEffectiveDateInSeconds}      | ${oneDayAfterLatestEffectiveDateInSeconds}
    `(
      'should filter out amendments with no effective date whose updated at is after the latest effective date (updated at date stored in $effectiveDateType)',
      ({ beforeLatestEffectiveDate, afterLatestEffectiveDate }: { beforeLatestEffectiveDate: number; afterLatestEffectiveDate: number }) => {
        // Arrange
        const amendmentUpdatedAtBeforeLatestEffectiveDate = {
          ...aCompletedTfmFacilityAmendment(),
          effectiveDate: undefined,
          updatedAt: beforeLatestEffectiveDate,
        };

        const amendmentUpdatedAtAfterLatestEffectiveDate = {
          ...aCompletedTfmFacilityAmendment(),
          effectiveDate: undefined,
          updatedAt: afterLatestEffectiveDate,
        };

        const amendments: TfmFacilityAmendment[] = [amendmentUpdatedAtBeforeLatestEffectiveDate, amendmentUpdatedAtAfterLatestEffectiveDate];

        // Act
        const result = filterAndSortCompletedEffectiveAmendments(amendments, latestEffectiveDate);

        // Assert
        expect(result).toEqual([amendmentUpdatedAtBeforeLatestEffectiveDate]);
      },
    );

    it.each`
      effectiveDateType                      | oneDayBeforeLatestEffectiveDate                  | twoDaysBeforeLatestEffectiveDate
      ${'milliseconds'}                      | ${oneDayBeforeLatestEffectiveDateInMilliseconds} | ${twoDaysBeforeLatestEffectiveDateInMilliseconds}
      ${'seconds'}                           | ${oneDayBeforeLatestEffectiveDateInSeconds}      | ${twoDaysBeforeLatestEffectiveDateInSeconds}
      ${'a mix of milliseconds and seconds'} | ${oneDayBeforeLatestEffectiveDateInMilliseconds} | ${twoDaysBeforeLatestEffectiveDateInSeconds}
    `(
      'should return completed effective amendments in reverse effective date order (effective date stored in $effectiveDateType)',
      ({
        oneDayBeforeLatestEffectiveDate,
        twoDaysBeforeLatestEffectiveDate,
      }: {
        oneDayBeforeLatestEffectiveDate: number;
        twoDaysBeforeLatestEffectiveDate: number;
      }) => {
        // Arrange
        const firstEffectiveAmendment = {
          ...aTfmFacilityAmendment(),
          status: AMENDMENT_STATUS.COMPLETED,
          effectiveDate: twoDaysBeforeLatestEffectiveDate,
        };

        const secondEffectiveAmendment = {
          ...aTfmFacilityAmendment(),
          status: AMENDMENT_STATUS.COMPLETED,
          effectiveDate: oneDayBeforeLatestEffectiveDate,
        };

        const amendments: TfmFacilityAmendment[] = [firstEffectiveAmendment, secondEffectiveAmendment];

        // Act
        const result = filterAndSortCompletedEffectiveAmendments(amendments, latestEffectiveDate);

        // Assert
        expect(result).toEqual([secondEffectiveAmendment, firstEffectiveAmendment]);
      },
    );

    it.each`
      effectiveDateType | twoDaysBeforeLatestEffectiveDate
      ${'milliseconds'} | ${twoDaysBeforeLatestEffectiveDateInMilliseconds}
      ${'seconds'}      | ${twoDaysBeforeLatestEffectiveDateInSeconds}
    `(
      'should include amendments without effective dates in the ordering by using their updated at instead (updated at date stored in $effectiveDateType)',
      ({ twoDaysBeforeLatestEffectiveDate }: { oneDayBeforeLatestEffectiveDate: number; twoDaysBeforeLatestEffectiveDate: number }) => {
        // Arrange
        const firstEffectiveAmendment = {
          ...aCompletedTfmFacilityAmendment(),
          effectiveDate: threeDaysBeforeLatestEffectiveDateInSeconds,
        };

        const secondEffectiveAmendment = {
          ...aCompletedTfmFacilityAmendment(),
          effectiveDate: oneDayBeforeLatestEffectiveDateInMilliseconds,
        };

        const amendmentWithNoEffectiveDate = {
          ...aCompletedTfmFacilityAmendment(),
          effectiveDate: undefined,
          updatedAt: twoDaysBeforeLatestEffectiveDate,
        };

        const amendments: TfmFacilityAmendment[] = [firstEffectiveAmendment, secondEffectiveAmendment, amendmentWithNoEffectiveDate];

        // Act
        const result = filterAndSortCompletedEffectiveAmendments(amendments, latestEffectiveDate);

        // Assert
        expect(result).toEqual([secondEffectiveAmendment, amendmentWithNoEffectiveDate, firstEffectiveAmendment]);
      },
    );
  });
});
