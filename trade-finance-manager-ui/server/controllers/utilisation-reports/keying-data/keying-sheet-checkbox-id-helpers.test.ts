import { getFeeRecordIdsForKeyingSheetRowsWithStatusFromObjectKeys } from './keying-sheet-checkbox-id-helpers';

describe('keying-sheet-checkbox-id-helpers', () => {
  describe('getFeeRecordIdsForRowsWithStatusFromObjectKeys', () => {
    it('returns all fee record ids of fee records with status TO_DO from the object keys', () => {
      // Arrange
      const object = {
        'feeRecordId-123-status-TO_DO': 'on',
        'feeRecordId-45678-status-TO_DO': 13,
        'feeRecordId-999-status-DONE': 'on',
        'other-key': 'value',
      };

      // Act
      const feeRecordIds = getFeeRecordIdsForKeyingSheetRowsWithStatusFromObjectKeys(object, 'TO_DO');

      // Assert
      expect(feeRecordIds).toEqual([123, 45678]);
    });

    it('returns all fee record ids of fee records with status DONE from the object keys', () => {
      // Arrange
      const object = {
        'feeRecordId-123-status-TO_DO': 'on',
        'feeRecordId-45678-status-DONE': 13,
        'feeRecordId-999-status-DONE': 'on',
        'other-key': 'value',
      };

      // Act
      const feeRecordIds = getFeeRecordIdsForKeyingSheetRowsWithStatusFromObjectKeys(object, 'DONE');

      // Assert
      expect(feeRecordIds).toEqual([45678, 999]);
    });
  });
});
