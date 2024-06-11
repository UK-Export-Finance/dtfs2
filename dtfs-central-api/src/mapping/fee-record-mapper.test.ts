import {
  CURRENCY,
  CurrencyAndAmount,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments, mapFeeRecordEntitiesToTotalReportedPayments } from './fee-record-mapper';

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

  describe('mapFeeRecordEntitiesToTotalReportedPayments', () => {
    it('throws an error when the supplied list of fee records is empty', () => {
      // Arrange
      const feeRecords: FeeRecordEntity[] = [];

      // Act / Assert
      expect(() => mapFeeRecordEntitiesToTotalReportedPayments(feeRecords)).toThrow(Error);
    });

    it("returns the total of the fee record 'feesPaidToUkefForThePeriod' when the payment currency matches the fees paid currency", () => {
      // Arrange
      const utilisationReport = aUtilisationReport();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withFeesPaidToUkefForThePeriod(100)
          .withFeesPaidToUkefForThePeriodCurrency('GBP')
          .withPaymentCurrency('GBP')
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withFeesPaidToUkefForThePeriod(50)
          .withFeesPaidToUkefForThePeriodCurrency('GBP')
          .withPaymentCurrency('GBP')
          .build(),
      ];

      // Act
      const totalReportedPayments = mapFeeRecordEntitiesToTotalReportedPayments(feeRecords);

      // Assert
      expect(totalReportedPayments).toEqual<CurrencyAndAmount>({
        currency: 'GBP',
        amount: 150,
      });
    });

    it("returns the total of the fee record 'feesPaidToUkefForThePeriod' converted to the payment currency when the payment currency does not match the fees paid currency", () => {
      // Arrange
      const utilisationReport = aUtilisationReport();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withFeesPaidToUkefForThePeriod(100)
          .withFeesPaidToUkefForThePeriodCurrency('GBP')
          .withPaymentCurrency('EUR')
          .withPaymentExchangeRate(1.1)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withFeesPaidToUkefForThePeriod(50)
          .withFeesPaidToUkefForThePeriodCurrency('GBP')
          .withPaymentCurrency('EUR')
          .withPaymentExchangeRate(1.1)
          .build(),
      ];

      // Act
      const totalReportedPayments = mapFeeRecordEntitiesToTotalReportedPayments(feeRecords);

      // Assert
      expect(totalReportedPayments).toEqual<CurrencyAndAmount>({
        currency: 'EUR',
        amount: 136.36,
      });
    });
  });

  function aUtilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
  }
});
