import {
  getFeeRecordIdsFromEditPremiumPaymentsCheckboxIds,
  getEditPremiumPaymentsCheckboxIdsFromObjectKeys,
} from './edit-premium-payments-table-checkbox-id-helper';
import { EditPremiumPaymentsTableCheckboxId } from '../types/edit-premium-payments-table-checkbox-id';

describe('edit premium payments table checkbox id helper', () => {
  describe('getFeeRecordIdsFromEditPremiumPaymentsCheckboxIds', () => {
    it('extracts all the fee records ids from multiple checkbox ids', () => {
      // Arrange
      const checkboxId1: EditPremiumPaymentsTableCheckboxId = `feeRecordId-7`;
      const checkboxId2: EditPremiumPaymentsTableCheckboxId = `feeRecordId-77`;

      // Act
      const extractedIds = getFeeRecordIdsFromEditPremiumPaymentsCheckboxIds([checkboxId1, checkboxId2]);

      // Assert
      expect(extractedIds).toEqual([7, 77]);
    });
  });

  describe('getEditPremiumPaymentsCheckboxIdsFromObjectKeys', () => {
    it('extracts all object keys which match the checkbox id format', () => {
      // Arrange
      const object = {
        'feeRecordId-7': 'on',
        'feeRecordId-77': 'on',
        someOtherField: 'on',
      };

      // Act
      const checkboxIds = getEditPremiumPaymentsCheckboxIdsFromObjectKeys(object);

      // Assert
      expect(checkboxIds).toEqual(['feeRecordId-7', 'feeRecordId-77']);
    });
  });
});
