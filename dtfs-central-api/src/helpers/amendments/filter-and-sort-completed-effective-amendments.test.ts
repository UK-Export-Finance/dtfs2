import { AMENDMENT_STATUS, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { addDays, subDays } from 'date-fns';
import { aCompletedTfmFacilityAmendment, aTfmFacilityAmendment } from '../../../test-helpers';
import { filterAndSortCompletedEffectiveAmendments } from './filter-and-sort-completed-effective-amendments';

describe('filter-and-sort-completed--effective-amendments', () => {
  describe('filterAndSortCompletedEffectiveAmendments', () => {
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

    it('should filter out all amendments with effective date after latestEffectiveDate', () => {
      // Arrange
      const latestEffectiveDate = new Date('2024-02-28');
      const beforeLatestEffectiveDate = subDays(latestEffectiveDate, 1);
      const afterLatestEffectiveDate = addDays(latestEffectiveDate, 1);

      const amendmentEffectiveBeforeLatestEffectiveDate = {
        ...aCompletedTfmFacilityAmendment(),
        effectiveDate: beforeLatestEffectiveDate.getTime(),
      };

      const amendmentEffectiveAfterLatestEffectiveDate = {
        ...aCompletedTfmFacilityAmendment(),
        effectiveDate: afterLatestEffectiveDate.getTime(),
      };

      const amendments: TfmFacilityAmendment[] = [amendmentEffectiveBeforeLatestEffectiveDate, amendmentEffectiveAfterLatestEffectiveDate];

      // Act
      const result = filterAndSortCompletedEffectiveAmendments(amendments, latestEffectiveDate);

      // Assert
      expect(result).toEqual([amendmentEffectiveBeforeLatestEffectiveDate]);
    });

    it('should filter out amendments with no effective date whose updated at is after the latest effective date', () => {
      // Arrange
      const latestEffectiveDate = new Date('2024-02-28');
      const beforeLatestEffectiveDate = subDays(latestEffectiveDate, 1);
      const afterLatestEffectiveDate = addDays(latestEffectiveDate, 1);

      const amendmentUpdatedAtBeforeLatestEffectiveDate = {
        ...aCompletedTfmFacilityAmendment(),
        effectiveDate: undefined,
        updatedAt: beforeLatestEffectiveDate.getTime(),
      };

      const amendmentUpdatedAtAfterLatestEffectiveDate = {
        ...aCompletedTfmFacilityAmendment(),
        effectiveDate: undefined,
        updatedAt: afterLatestEffectiveDate.getTime(),
      };

      const amendments: TfmFacilityAmendment[] = [amendmentUpdatedAtBeforeLatestEffectiveDate, amendmentUpdatedAtAfterLatestEffectiveDate];

      // Act
      const result = filterAndSortCompletedEffectiveAmendments(amendments, latestEffectiveDate);

      // Assert
      expect(result).toEqual([amendmentUpdatedAtBeforeLatestEffectiveDate]);
    });

    it('should return completed effective amendments in reverse effective date order', () => {
      // Arrange
      const latestEffectiveDate = new Date('2024-05-10');
      const twoDaysBeforeLatestEffectiveDate = subDays(latestEffectiveDate, 2);
      const oneDayBeforeLatestEffectiveDate = subDays(latestEffectiveDate, 1);

      const firstEffectiveAmendment = {
        ...aTfmFacilityAmendment(),
        status: AMENDMENT_STATUS.COMPLETED,
        effectiveDate: twoDaysBeforeLatestEffectiveDate.getTime(),
      };

      const secondEffectiveAmendment = {
        ...aTfmFacilityAmendment(),
        status: AMENDMENT_STATUS.COMPLETED,
        effectiveDate: oneDayBeforeLatestEffectiveDate.getTime(),
      };

      const amendments: TfmFacilityAmendment[] = [firstEffectiveAmendment, secondEffectiveAmendment];

      // Act
      const result = filterAndSortCompletedEffectiveAmendments(amendments, latestEffectiveDate);

      // Assert
      expect(result).toEqual([secondEffectiveAmendment, firstEffectiveAmendment]);
    });

    it('should include amendments without effective dates in the ordering by using their updated at instead', () => {
      // Arrange
      const latestEffectiveDate = new Date('2024-05-10');
      const threeDaysBeforeLatestEffectiveDate = subDays(latestEffectiveDate, 3);
      const twoDaysBeforeLatestEffectiveDate = subDays(latestEffectiveDate, 2);
      const oneDayBeforeLatestEffectiveDate = subDays(latestEffectiveDate, 1);

      const firstEffectiveAmendment = {
        ...aCompletedTfmFacilityAmendment(),
        effectiveDate: threeDaysBeforeLatestEffectiveDate.getTime(),
      };

      const secondEffectiveAmendment = {
        ...aCompletedTfmFacilityAmendment(),
        effectiveDate: undefined,
        updatedAt: oneDayBeforeLatestEffectiveDate.getTime(),
      };

      const amendmentWithNoEffectiveDate = {
        ...aCompletedTfmFacilityAmendment(),
        effectiveDate: undefined,
        updatedAt: twoDaysBeforeLatestEffectiveDate.getTime(),
      };

      const amendments: TfmFacilityAmendment[] = [firstEffectiveAmendment, secondEffectiveAmendment, amendmentWithNoEffectiveDate];

      // Act
      const result = filterAndSortCompletedEffectiveAmendments(amendments, latestEffectiveDate);

      // Assert
      expect(result).toEqual([secondEffectiveAmendment, amendmentWithNoEffectiveDate, firstEffectiveAmendment]);
    });
  });
});
