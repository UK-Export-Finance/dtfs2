import { getFeeRecordIdsFromEditPaymentsCheckboxIds, getEditPaymentsCheckboxIdsFromObjectKeys } from './edit-payments-table-checkbox-id-helper';
import { EditPaymentsTableCheckboxId } from '../types/edit-payments-table-checkbox-id';

describe('edit payments table checkbox id helper', () => {
  describe('getFeeRecordIdsFromEditPaymentsCheckboxIds', () => {
    it('extracts all the fee record ids from multiple checkbox ids', () => {
      // Arrange
      const checkboxId1: EditPaymentsTableCheckboxId = `feeRecordId-7`;
      const checkboxId2: EditPaymentsTableCheckboxId = `feeRecordId-77`;

      // Act
      const extractedIds = getFeeRecordIdsFromEditPaymentsCheckboxIds([checkboxId1, checkboxId2]);

      // Assert
      expect(extractedIds).toEqual([7, 77]);
    });
  });

  describe('getEditPaymentsCheckboxIdsFromObjectKeys', () => {
    it('extracts all object keys which match the checkbox id format', () => {
      // Arrange
      const object = {
        'feeRecordId-7': 'on',
        'feeRecordId-77': 'on',
        someOtherField: 'on',
      };

      // Act
      const checkboxIds = getEditPaymentsCheckboxIdsFromObjectKeys(object);

      // Assert
      expect(checkboxIds).toEqual(['feeRecordId-7', 'feeRecordId-77']);
    });
  });
});
