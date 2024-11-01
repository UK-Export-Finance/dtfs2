import { Currency, FeeRecordEntity, FeeRecordEntityMockBuilder, UTILISATION_REPORT_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { validateSelectedFeeRecordsAllHaveSamePaymentCurrency } from './selected-fee-record-validator';
import { InvalidPayloadError } from '../../../errors';

describe('selected fee record validator', () => {
  describe('validateSelectedFeeRecordsAllHaveSamePaymentCurrency', () => {
    it('does not throw if only one fee record', () => {
      // Arrange
      const selectedFeeRecords = [
        FeeRecordEntityMockBuilder.forReport(
          UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS).build(),
        ).build(),
      ];

      // Act + Assert
      expect(() => validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords)).not.toThrow();
    });

    it('does not throw if no fee records provided', () => {
      // Arrange
      const selectedFeeRecords: FeeRecordEntity[] = [];

      // Act + Assert
      expect(() => validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords)).not.toThrow();
    });

    it('does not throw if no all fee records have the same payment currency', () => {
      // Arrange
      const selectedFeeRecords = [aFeeRecordWithPaymentCurrency('GBP'), aFeeRecordWithPaymentCurrency('GBP')];

      // Act + Assert
      expect(() => validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords)).not.toThrow();
    });

    it('throws invalid payload error if any two fee records have differing payment currency', () => {
      // Arrange
      const selectedFeeRecords = [aFeeRecordWithPaymentCurrency('GBP'), aFeeRecordWithPaymentCurrency('JPY')];

      // Act + Assert
      expect(() => validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords)).toThrow(InvalidPayloadError);
    });
  });

  function aFeeRecordWithPaymentCurrency(paymentCurrency: Currency) {
    return FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS).build())
      .withPaymentCurrency(paymentCurrency)
      .build();
  }
});
