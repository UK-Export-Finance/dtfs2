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
      const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-${idList.join(',')}-reportedPaymentsCurrency-GBP-status-TO_DO`;

      // Act
      const extractedIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds([checkboxId]);

      // Assert
      expect(extractedIds).toEqual(idList);
    });

    it('extracts all the fee records ids from multiple checkbox ids', () => {
      // Arrange
      const idList = [1, 2, 23, 5, 6];
      const checkboxId1: PremiumPaymentsTableCheckboxId = `feeRecordIds-1,2-reportedPaymentsCurrency-GBP-status-TO_DO`;
      const checkboxId2: PremiumPaymentsTableCheckboxId = `feeRecordIds-23,5,6-reportedPaymentsCurrency-GBP-status-TO_DO`;

      // Act
      const extractedIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds([checkboxId1, checkboxId2]);

      // Assert
      expect(extractedIds).toEqual(idList);
    });
  });

  describe('getPremiumPaymentsCheckboxIdsFromObjectKeys', () => {
    it('extracts all object keys which match the checkbox id format', () => {
      // Arrange
      const object = {
        'feeRecordIds-123-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
        'feeRecordIds-456-reportedPaymentsCurrency-EUR-status-DOES_NOT_MATCH': 'on',
        someOtherField: 'on',
      };

      // Act
      const checkboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(object);

      // Assert
      expect(checkboxIds).toEqual([
        'feeRecordIds-123-reportedPaymentsCurrency-GBP-status-TO_DO',
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
