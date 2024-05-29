import { EntityManager } from 'typeorm';
import { feeRecordsMatchAttachedPayments } from './helpers';
import {
  Currency,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';

describe('payment-added-to-fee-record.event-handler helpers', () => {
  describe('feeRecordsMatchAttachedPayments', () => {
    const mockEntityManager = {
      find: jest.fn(),
    } as unknown as EntityManager;

    const addPaymentsToFeeRecords = (feeRecords: FeeRecordEntity[], payments?: PaymentEntity[]): FeeRecordEntity[] =>
      feeRecords.map((feeRecord) => {
        feeRecord.payments = payments ?? [];
        return feeRecord;
      });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("calls the 'transactionEntityManager.find' method to fetch all payments attached to the fee record", async () => {
      // Arrange
      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build(),
      ];

      jest.mocked(mockEntityManager.find).mockResolvedValue(addPaymentsToFeeRecords(feeRecords));

      // Act
      await feeRecordsMatchAttachedPayments(feeRecords, mockEntityManager);

      // Assert
      expect(mockEntityManager.find).toHaveBeenCalledWith(FeeRecordEntity, {
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

      jest.mocked(mockEntityManager.find).mockResolvedValue(addPaymentsToFeeRecords(feeRecords, payments));

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

      jest.mocked(mockEntityManager.find).mockResolvedValue(addPaymentsToFeeRecords(feeRecords, payments));

      // Act
      const result = await feeRecordsMatchAttachedPayments(feeRecords, mockEntityManager);

      // Assert
      expect(result).toBe(false);
    });
  });
});
