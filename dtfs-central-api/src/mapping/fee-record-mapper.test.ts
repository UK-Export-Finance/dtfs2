import { CURRENCY, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from './fee-record-mapper';

describe('fee record mapper', () => {
  describe('mapFeeRecordEntityToReportedFees', () => {
    it('maps fees paid to ukef for the period currency to the reported fee currency', () => {
      // Arrange
      const currency = CURRENCY.JPY;
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriodCurrency(currency)
        .build();

      // Act
      const reportedFees = mapFeeRecordEntityToReportedFees(feeRecordEntity);

      // Assert
      expect(reportedFees.currency).toEqual(currency);
    });

    it('maps fees paid to ukef for the period to the reported fee amount', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(123456.78)
        .build();

      // Act
      const reportedFees = mapFeeRecordEntityToReportedFees(feeRecordEntity);

      // Assert
      expect(reportedFees.amount).toEqual(123456.78);
    });
  });

  describe('mapFeeRecordEntityToReportedPayments', () => {
    it('maps payment currency to reported payment currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriodCurrency('JPY')
        .withPaymentCurrency('EUR')
        .build();

      // Act
      const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecordEntity);

      // Assert
      expect(reportedPayments.currency).toEqual('EUR');
    });

    it('maps fees paid to ukef for the period to the reported payment amount when payment currency matches fees paid to ukef for the period currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(123456.78)
        .withFeesPaidToUkefForThePeriodCurrency('JPY')
        .withPaymentCurrency('JPY')
        .build();

      // Act
      const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecordEntity);

      // Assert
      expect(reportedPayments.amount).toEqual(123456.78);
    });

    it('converts fees paid to ukef for the period to the payment currency and maps to amount when payment currency does not match fees paid to ukef for the period currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(123.45)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency('JPY')
        .withPaymentExchangeRate(0.0059)
        .build();
      /**
       * expected amount = feesPaidToUkefForThePeriod / paymentExchangeRate
       *                 = 123.45 / 0.0059
       *                 = 20923.73 (rounded to two decimal places)
       *  */
      const expectedReportedPaymentAmount = 20923.73;

      // Act
      const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecordEntity);

      // Assert
      expect(reportedPayments.amount).toEqual(expectedReportedPaymentAmount);
    });
  });
});
