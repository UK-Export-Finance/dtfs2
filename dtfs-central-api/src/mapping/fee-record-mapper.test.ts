import { difference } from 'lodash';
import {
  CURRENCY,
  Currency,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  KeyingSheetRowStatus,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import {
  mapFeeRecordEntityToFeeRecord,
  mapFeeRecordEntityToKeyingSheetRowStatus,
  mapFeeRecordEntityToReportedFees,
  mapFeeRecordEntityToReportedPayments,
} from './fee-record-mapper';

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

  describe('mapFeeRecordEntityToFeeRecord', () => {
    it('maps the fee record entity id to the fee record id', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withId(10).build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.id).toBe(10);
    });

    it('maps the fee record entity facility id to the fee record facilityId', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId('27182818').build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.facilityId).toBe('27182818');
    });

    it('maps the fee record entity exporter to the fee record exporter', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withExporter('Test exporter').build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.exporter).toBe('Test exporter');
    });

    it('maps the fee record entity fees paid currency to the fee record reported fees currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFeesPaidToUkefForThePeriodCurrency('EUR').build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.reportedFees.currency).toBe('EUR');
    });

    it('maps the fee record entity fees paid to the fee record reported fees amount', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFeesPaidToUkefForThePeriod(314.59).build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.reportedFees.amount).toBe(314.59);
    });

    describe('when the fee record entity payment currency matches the fees paid currency', () => {
      const currency: Currency = 'EUR';

      it('maps the fee record entity fees paid currency to the fee record reported payments currency', () => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriodCurrency(currency)
          .withPaymentCurrency(currency)
          .build();

        // Act
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

        // Assert
        expect(feeRecord.reportedPayments.currency).toBe('EUR');
      });

      it('maps the fee record entity fees paid to the fee record reported payment amount', () => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriodCurrency(currency)
          .withPaymentCurrency(currency)
          .withFeesPaidToUkefForThePeriod(314.59)
          .build();

        // Act
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

        // Assert
        expect(feeRecord.reportedPayments.amount).toBe(314.59);
      });
    });

    describe('when the fee record entity payment currency does not match the fees paid currency', () => {
      const feesPaidCurrency: Currency = 'EUR';
      const paymentCurrency: Currency = 'GBP';

      const paymentExchangeRate = 1.1;

      const feesPaidAmount = 100;
      const feesPaidInPaymentCurrencyAmount = 90.91; // 100 / 1.1

      it('maps the fee record entity payment currency to the fee record reported payments currency', () => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriodCurrency(feesPaidCurrency)
          .withFeesPaidToUkefForThePeriod(feesPaidAmount)
          .withPaymentCurrency(paymentCurrency)
          .withPaymentExchangeRate(paymentExchangeRate)
          .build();

        // Act
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

        // Assert
        expect(feeRecord.reportedPayments.currency).toBe(paymentCurrency);
      });

      it('maps the fee record entity fees paid to the fee record reported payment amount in the payment currency', () => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriodCurrency(feesPaidCurrency)
          .withFeesPaidToUkefForThePeriod(feesPaidAmount)
          .withPaymentCurrency(paymentCurrency)
          .withPaymentExchangeRate(paymentExchangeRate)
          .build();

        // Act
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

        // Assert
        expect(feeRecord.reportedPayments.amount).toBe(feesPaidInPaymentCurrencyAmount);
      });
    });
  });

  describe('mapFeeRecordEntityToKeyingSheetRowStatus', () => {
    const INVALID_FEE_RECORD_STATUSES = difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]);

    it.each(INVALID_FEE_RECORD_STATUSES)('throws an error when the fee record entity status is %s', (status) => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build();

      // Act / Assert
      expect(() => mapFeeRecordEntityToKeyingSheetRowStatus(feeRecord)).toThrow(Error);
    });

    it('maps the fee record READY_TO_KEY status to the keying sheet TO_DO status', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build();

      // Act
      const result = mapFeeRecordEntityToKeyingSheetRowStatus(feeRecord);

      // Assert
      expect(result).toBe<KeyingSheetRowStatus>('TO_DO');
    });

    it('maps the fee record RECONCILED status to the keying sheet DONE status', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('RECONCILED').build();

      // Act
      const result = mapFeeRecordEntityToKeyingSheetRowStatus(feeRecord);

      // Assert
      expect(result).toBe<KeyingSheetRowStatus>('DONE');
    });
  });

  function aUtilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});
