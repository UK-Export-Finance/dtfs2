import { EntityManager } from 'typeorm';
import {
  Currency,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { feeRecordsMatchAttachedPayments } from './helpers';

describe('payment-added-to-fee-record.event-handler helpers', () => {
  describe('feeRecordsMatchAttachedPayments', () => {
    const mockFind = jest.fn();
    const mockEntityManager = {
      find: mockFind,
    } as unknown as EntityManager;

    const addPaymentsToFeeRecords = (feeRecords: FeeRecordEntity[], payments?: PaymentEntity[]): FeeRecordEntity[] =>
      feeRecords.map((feeRecord) => {
        // eslint-disable-next-line no-param-reassign
        feeRecord.payments = payments ?? [];
        return feeRecord;
      });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('finds the fee record corresponding to the first supplied fee record with the attached payments included', async () => {
      // Arrange
      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build(),
      ];

      jest.mocked(mockFind).mockResolvedValue(addPaymentsToFeeRecords(feeRecords));

      // Act
      await feeRecordsMatchAttachedPayments(feeRecords, mockEntityManager);

      // Assert
      expect(mockFind).toHaveBeenCalledWith(FeeRecordEntity, {
        where: { id: feeRecords[0].id },
        relations: { payments: true },
      });
    });

    it('returns true when the payments attached to the fee records have the same total payments', async () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';
      const firstFeeRecordAmount = 100;
      const secondFeeRecordAmount = 50;
      const firstPaymentAmount = 30;
      const secondPaymentAmount = 120;

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(1)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(2)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
          .build(),
      ];

      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmountReceived(firstPaymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmountReceived(secondPaymentAmount).build(),
      ];

      jest.mocked(mockFind).mockResolvedValue(addPaymentsToFeeRecords(feeRecords, payments));

      // Act
      const result = await feeRecordsMatchAttachedPayments(feeRecords, mockEntityManager);

      // Assert
      expect(result).toBe(true);
    });

    it('returns false when the payments attached to the fee records do not have the same total payments', async () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';
      const firstFeeRecordAmount = 100;
      const secondFeeRecordAmount = 50;
      const firstPaymentAmount = 30;
      const secondPaymentAmount = 100;

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(1)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(2)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
          .build(),
      ];

      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmountReceived(firstPaymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmountReceived(secondPaymentAmount).build(),
      ];

      jest.mocked(mockFind).mockResolvedValue(addPaymentsToFeeRecords(feeRecords, payments));

      // Act
      const result = await feeRecordsMatchAttachedPayments(feeRecords, mockEntityManager);

      // Assert
      expect(result).toBe(false);
    });

    it('returns true when the payments attached to the fee records have the same total payments when converted to the payment currency', async () => {
      // Arrange
      const feesPaidToUkefForThePeriodCurrency: Currency = 'EUR';
      const paymentExchangeRate = 1.1;
      const firstFeeRecordAmount = 100; // = 90.91 GBP
      const secondFeeRecordAmount = 50; // = 45.45 GBP

      const paymentCurrency: Currency = 'GBP';
      const firstPaymentAmount = 30;
      const secondPaymentAmount = 106.36;

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(1)
          .withPaymentCurrency(paymentCurrency)
          .withPaymentExchangeRate(paymentExchangeRate)
          .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
          .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(2)
          .withPaymentCurrency(paymentCurrency)
          .withPaymentExchangeRate(paymentExchangeRate)
          .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
          .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
          .build(),
      ];

      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmountReceived(firstPaymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmountReceived(secondPaymentAmount).build(),
      ];

      jest.mocked(mockFind).mockResolvedValue(addPaymentsToFeeRecords(feeRecords, payments));

      // Act
      const result = await feeRecordsMatchAttachedPayments(feeRecords, mockEntityManager);

      // Assert
      expect(result).toBe(true);
    });
  });
});
