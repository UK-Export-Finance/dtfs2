import { CURRENCY, Currency, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import {
  getFeeRecordIdFromPremiumPaymentsCheckboxId,
  getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId,
  getFeeRecordStatusFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from './premium-payments-table-checkbox-id-helper';
import { PremiumPaymentsTableCheckboxId } from '../types/premium-payments-table-checkbox-id';

describe('premium payments table checkbox id helper', () => {
  describe('getFeeRecordIdsFromPremiumPaymentsCheckboxId', () => {
    it('extracts the fee record id from the checkbox id', () => {
      // Arrange
      const checkboxId = 'feeRecordId-123-reportedPaymentsCurrency-GBP-status-TO_DO';

      // Act
      const feeRecordId = getFeeRecordIdFromPremiumPaymentsCheckboxId(checkboxId);

      // Assert
      expect(feeRecordId).toEqual(123);
    });
  });

  describe('getPremiumPaymentsCheckboxIdsFromObjectKeys', () => {
    it('extracts all object keys which match the checkbox id format', () => {
      // Arrange
      const object = {
        'feeRecordId-123-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
        'feeRecordId-456-reportedPaymentsCurrency-EUR-status-DOES_NOT_MATCH': 'on',
        someOtherField: 'on',
      };

      // Act
      const checkboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(object);

      // Assert
      expect(checkboxIds).toEqual([
        'feeRecordId-123-reportedPaymentsCurrency-GBP-status-TO_DO',
        'feeRecordId-456-reportedPaymentsCurrency-EUR-status-DOES_NOT_MATCH',
      ]);
    });
  });

  describe('getFeeRecordStatusFromPremiumPaymentsCheckboxId', () => {
    it.each(Object.values(FEE_RECORD_STATUS))('extracts the fee record status from the check box id %s', (status: FeeRecordStatus) => {
      // Arrange
      const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordId-123-reportedPaymentsCurrency-GBP-status-${status}`;

      // Act
      const extractedStatus = getFeeRecordStatusFromPremiumPaymentsCheckboxId(checkboxId);

      // Assert
      expect(extractedStatus).toEqual(status);
    });
  });

  describe('getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId', () => {
    it.each(Object.values(CURRENCY))('extracts the fee record payment currency from the check box id %s', (currency: Currency) => {
      // Arrange
      const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordId-123-reportedPaymentsCurrency-${currency}-status-TO_DO`;

      // Act
      const extractedCurrency = getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId(checkboxId);

      // Assert
      expect(extractedCurrency).toEqual(currency);
    });
  });
});
