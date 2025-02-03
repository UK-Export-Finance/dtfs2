import difference from 'lodash.difference';
import { FEE_RECORD_STATUS } from '../constants';
import { FeeRecordStatus } from '../types';
import { allStatusesAreTheSameOrCombinationOfToDoStatuses, isStatusToDoOrToDoAmended } from './fee-record-status';

describe('fee-record-status helpers', () => {
  describe('allStatusesAreTheSameOrCombinationOfToDoStatuses', () => {
    it.each(Object.values(FEE_RECORD_STATUS))('should return true when there is just one status - status %s', (status) => {
      // Arrange
      const statuses = new Set<FeeRecordStatus>([status]);

      // Act
      const result = allStatusesAreTheSameOrCombinationOfToDoStatuses(statuses);

      // Assert
      expect(result).toEqual(true);
    });

    it('should return true when statuses are TO_DO and TO_DO_AMENDED', () => {
      // Arrange
      const statuses = new Set<FeeRecordStatus>([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.TO_DO_AMENDED]);

      // Act
      const result = allStatusesAreTheSameOrCombinationOfToDoStatuses(statuses);

      // Assert
      expect(result).toEqual(true);
    });

    it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.TO_DO_AMENDED]))(
      'should return false when there are multiple statuses and one is not TO_DO or TO_DO_AMENDED - status %s',
      (status: FeeRecordStatus) => {
        // Arrange
        const statuses = new Set<FeeRecordStatus>([FEE_RECORD_STATUS.TO_DO, status]);

        // Act
        const result = allStatusesAreTheSameOrCombinationOfToDoStatuses(statuses);

        // Assert
        expect(result).toEqual(false);
      },
    );

    it('should return false when there are more than two statuses', () => {
      // Arrange
      const statuses = new Set<FeeRecordStatus>([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.TO_DO_AMENDED, FEE_RECORD_STATUS.MATCH]);

      // Act
      const result = allStatusesAreTheSameOrCombinationOfToDoStatuses(statuses);

      // Assert
      expect(result).toEqual(false);
    });

    it('should return false when the set is empty', () => {
      // Arrange
      const statuses = new Set<FeeRecordStatus>();

      // Act
      const result = allStatusesAreTheSameOrCombinationOfToDoStatuses(statuses);

      // Assert
      expect(result).toEqual(false);
    });
  });

  describe('statusIsToDoOrToDoAmended', () => {
    it.each([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.TO_DO_AMENDED])('should return true for %s status', (status) => {
      // Act
      const result = isStatusToDoOrToDoAmended(status);

      // Assert
      expect(result).toEqual(true);
    });

    it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.TO_DO_AMENDED]))(
      'should return false for status %s',
      (status: FeeRecordStatus) => {
        // Act
        const result = isStatusToDoOrToDoAmended(status);

        // Assert
        expect(result).toEqual(false);
      },
    );
  });
});
