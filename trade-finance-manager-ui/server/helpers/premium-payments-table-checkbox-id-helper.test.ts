import { CURRENCY, Currency, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import {
  getFeeRecordIdsFromPremiumPaymentsCheckboxIds,
  getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId,
  getFeeRecordStatusFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from './premium-payments-table-checkbox-id-helper';
import { PremiumPaymentsTableCheckboxId } from '../types/premium-payments-table-checkbox-id';

describe('premium payments table checkbox id helper', () => {
  describe('getFeeRecordIdsFromPremiumPaymentsCheckboxIds', () => {
    it('extracts all the fee record ids in a single checkbox id', () => {
      // Arrange
      const idList = [1, 27, 314];
      const checkboxId: PremiumPaymentsTableCheckboxId = 'feeRecordIds-1,27,314-reportedPaymentsCurrency-GBP-status-TO_DO';

      // Act
      const extractedIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds([checkboxId]);

      // Assert
      expect(extractedIds).toEqual(idList);
    });

    it('extracts all the fee records ids from multiple checkbox ids', () => {
      // Arrange
      const checkboxId1: PremiumPaymentsTableCheckboxId = `feeRecordIds-2-reportedPaymentsCurrency-GBP-status-TO_DO`;
      const checkboxId2: PremiumPaymentsTableCheckboxId = `feeRecordIds-5,6,77,1234-reportedPaymentsCurrency-USD-status-TO_DO`;

      // Act
      const extractedIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds([checkboxId1, checkboxId2]);

      // Assert
      expect(extractedIds).toEqual([2, 5, 6, 77, 1234]);
    });
  });

  describe('getPremiumPaymentsCheckboxIdsFromObjectKeys', () => {
    it.each(Object.values(FEE_RECORD_STATUS))('extracts object key which match the checkbox id format for status %s', (status) => {
      // Arrange
      const checkboxId = `feeRecordIds-123-reportedPaymentsCurrency-GBP-status-${status}`;
      const object = {
        [checkboxId]: 'on',
        someOtherField: 'on',
      };

      // Act
      const checkboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(object);

      // Assert
      expect(checkboxIds).toEqual([checkboxId]);
    });

    it.each(Object.values(CURRENCY))('extracts object key which match the checkbox id format for currency %s', (currency) => {
      // Arrange
      const checkboxId = `feeRecordIds-123-reportedPaymentsCurrency-${currency}-status-TO_DO`;
      const object = {
        [checkboxId]: 'on',
        someOtherField: 'on',
      };

      // Act
      const checkboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(object);

      // Assert
      expect(checkboxIds).toEqual([checkboxId]);
    });

    it('extracts all object keys which match the checkbox id format', () => {
      // Arrange
      const object = {
        'feeRecordIds-123-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
        'feeRecordIds-123-reportedPaymentsCurrency-JPY-status-TO_DO_AMENDED': 'on',
        'feeRecordIds-456-reportedPaymentsCurrency-EUR-status-DOES_NOT_MATCH': 'on',
        someOtherField: 'on',
      };

      // Act
      const checkboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(object);

      // Assert
      expect(checkboxIds).toEqual([
        'feeRecordIds-123-reportedPaymentsCurrency-GBP-status-TO_DO',
        'feeRecordIds-123-reportedPaymentsCurrency-JPY-status-TO_DO_AMENDED',
        'feeRecordIds-456-reportedPaymentsCurrency-EUR-status-DOES_NOT_MATCH',
      ]);
    });
  });

  describe('getFeeRecordStatusFromPremiumPaymentsCheckboxId', () => {
    it.each(Object.values(FEE_RECORD_STATUS))('extracts the fee record status from the check box id %s', (status: FeeRecordStatus) => {
      // Arrange
      const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-123-reportedPaymentsCurrency-GBP-status-${status}`;

      // Act
      const extractedStatus = getFeeRecordStatusFromPremiumPaymentsCheckboxId(checkboxId);

      // Assert
      expect(extractedStatus).toEqual(status);
    });
  });

  describe('getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId', () => {
    it.each(Object.values(CURRENCY))('extracts the fee record payment currency from the check box id %s', (currency: Currency) => {
      // Arrange
      const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-123-reportedPaymentsCurrency-${currency}-status-TO_DO`;

      // Act
      const extractedCurrency = getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId(checkboxId);

      // Assert
      expect(extractedCurrency).toEqual(currency);
    });
  });
});
