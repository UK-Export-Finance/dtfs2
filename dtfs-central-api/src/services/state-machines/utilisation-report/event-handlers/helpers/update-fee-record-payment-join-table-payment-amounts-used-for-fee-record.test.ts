import { EntityManager } from 'typeorm';
import {
  Currency,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordPaymentJoinTableEntity,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord } from './update-fee-record-payment-join-table-payment-amounts-used-for-fee-record';

describe('updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord', () => {
  const mockUpdate = jest.fn();

  const mockEntityManager = {
    update: mockUpdate,
  } as unknown as EntityManager;

  beforeEach(() => {
    mockUpdate.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when there is one fee record linked to one payment', () => {
    it('sets the paymentAmountUsedForFeeRecord to the payment amount when the fee record amount exactly matches the payment amount', async () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';

      const paymentId = 123;
      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).withAmount(1000).build();

      const feeRecordId = 456;
      const matchFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('MATCH')
        .withId(feeRecordId)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(1000)
        .withPayments([payment])
        .build();

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord([matchFeeRecord], mockEntityManager);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId,
          paymentId,
        },
        {
          paymentAmountUsedForFeeRecord: 1000,
        },
      );
    });

    it('sets the paymentAmountUsedForFeeRecord to the payment amount when the fee record amount does not exactly match the payment amount', async () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';

      const paymentId = 123;
      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).withAmount(1000).build();

      const feeRecordId = 456;
      const matchFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('MATCH')
        .withId(feeRecordId)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(800) // different to the payment amount
        .withPayments([payment])
        .build();

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord([matchFeeRecord], mockEntityManager);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId,
          paymentId,
        },
        {
          paymentAmountUsedForFeeRecord: 1000,
        },
      );
    });
  });

  describe('when there is a single bulk payment linked to many fee records', () => {
    const paymentCurrency: Currency = 'GBP';
    const paymentId = 123;

    const aBulkPayment = () => PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).withAmount(1000).build();

    const aMatchFeeRecordWithIdAmountAndPayment = (id: number, amount: number, payment: PaymentEntity) =>
      FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('MATCH')
        .withId(id)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(amount)
        .withPayments([payment])
        .build();

    it('sets the paymentAmountUsedForFeeRecord to the payment amount used for each fee record when the fee records exactly match the payment', async () => {
      // Arrange
      const payment = aBulkPayment();

      const matchFeeRecords: FeeRecordEntity[] = [
        aMatchFeeRecordWithIdAmountAndPayment(12, 150, payment),
        aMatchFeeRecordWithIdAmountAndPayment(24, 800, payment),
        aMatchFeeRecordWithIdAmountAndPayment(36, 50, payment),
      ];

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord(matchFeeRecords, mockEntityManager);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 12,
        },
        { paymentAmountUsedForFeeRecord: 150 },
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 24,
        },
        { paymentAmountUsedForFeeRecord: 800 },
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 36,
        },
        { paymentAmountUsedForFeeRecord: 50 },
      );
    });

    it('sets the paymentAmountUsedForFeeRecord to the payment amount used for each fee record when the fee record total is slightly greater than the payment amount due to tolerance', async () => {
      // Arrange
      const payment = aBulkPayment();

      const matchFeeRecords: FeeRecordEntity[] = [
        aMatchFeeRecordWithIdAmountAndPayment(12, 150, payment),
        aMatchFeeRecordWithIdAmountAndPayment(24, 800, payment),
        aMatchFeeRecordWithIdAmountAndPayment(36, 52, payment), // greater amount due to tolerance
      ];

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord(matchFeeRecords, mockEntityManager);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 12,
        },
        { paymentAmountUsedForFeeRecord: 150 },
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 24,
        },
        { paymentAmountUsedForFeeRecord: 800 },
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 36,
        },
        { paymentAmountUsedForFeeRecord: 50 },
      );
    });

    it('sets the paymentAmountUsedForFeeRecord to the payment amount used for each fee record when the fee record total is slightly smaller than the payment amount due to tolerance', async () => {
      // Arrange
      const payment = aBulkPayment();

      const matchFeeRecords: FeeRecordEntity[] = [
        aMatchFeeRecordWithIdAmountAndPayment(12, 150, payment),
        aMatchFeeRecordWithIdAmountAndPayment(24, 799, payment), // smaller amount due to tolerance
        aMatchFeeRecordWithIdAmountAndPayment(36, 50, payment),
      ];

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord(matchFeeRecords, mockEntityManager);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 12,
        },
        { paymentAmountUsedForFeeRecord: 150 },
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 24,
        },
        { paymentAmountUsedForFeeRecord: 799 },
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          paymentId,
          feeRecordId: 36,
        },
        { paymentAmountUsedForFeeRecord: 51 },
      );
    });
  });

  describe('when there are many payments linked to one fee record', () => {
    it('sets the paymentAmountUsedForFeeRecord for each of the payments attached to the fee record', async () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';

      const feeRecordId = 123;
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('MATCH')
        .withId(feeRecordId)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(1000)
        .build();

      const firstPaymentId = 12;
      const secondPaymentId = 34;
      const thirdPaymentId = 54;
      const payments: PaymentEntity[] = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(firstPaymentId).withAmount(800).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(secondPaymentId).withAmount(100).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(thirdPaymentId).withAmount(101).build(), // amount plus tolerance
      ];
      feeRecord.payments = payments;

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord([feeRecord], mockEntityManager);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        { feeRecordId, paymentId: firstPaymentId },
        { paymentAmountUsedForFeeRecord: 800 },
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        { feeRecordId, paymentId: secondPaymentId },
        { paymentAmountUsedForFeeRecord: 100 },
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        { feeRecordId, paymentId: thirdPaymentId },
        { paymentAmountUsedForFeeRecord: 101 },
      );
    });
  });

  describe('when there are many payments linked to many fee records', () => {
    const paymentCurrency: Currency = 'GBP';

    const aFeeRecordWithIdAmountAndPayments = (id: number, amount: number, payments: PaymentEntity[]) =>
      FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('MATCH')
        .withId(id)
        .withFeesPaidToUkefForThePeriod(amount)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withPayments(payments)
        .build();

    const aPaymentWithIdAndAmount = (id: number, amount: number) => PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(id).withAmount(amount).build();

    it('sets the paymentAmountUsedForFeeRecord by greedily splitting the payments across the fee records', async () => {
      // Arrange
      const payments = [
        aPaymentWithIdAndAmount(12, 1000), // payment A
        aPaymentWithIdAndAmount(24, 66.65), // payment B
        aPaymentWithIdAndAmount(36, 600), // payment C
      ];

      const matchFeeRecords = [
        aFeeRecordWithIdAmountAndPayments(1, 111.11, payments),
        aFeeRecordWithIdAmountAndPayments(5, 555.55, payments),
        aFeeRecordWithIdAmountAndPayments(3, 333.33, payments),
        aFeeRecordWithIdAmountAndPayments(4, 444.44, payments),
        aFeeRecordWithIdAmountAndPayments(2, 222.22, payments),
      ];

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord(matchFeeRecords, mockEntityManager);

      // Assert: Fee record with id = 5
      // - takes 555.55 from payment A (id=12) - payment A now has 444.45 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 5,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 555.55,
        },
      );

      // Assert: Fee record with id = 4
      // - takes 444.44 from payment C (id=36) - payment C now has 155.56 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 4,
          paymentId: 36,
        },
        {
          paymentAmountUsedForFeeRecord: 444.44,
        },
      );

      // Assert: Fee record with id = 3
      // - takes 333.33 from payment A (id=12) - payment A now has 111.12 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 3,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 333.33,
        },
      );

      // Assert: Fee record with id = 2
      // - takes 155.56 from payment C (id=36) - payment C now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 2,
          paymentId: 36,
        },
        {
          paymentAmountUsedForFeeRecord: 155.56,
        },
      );
      // - takes 66.66 from payment A (id=12) - payment A now has 44.46 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 2,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 66.66,
        },
      );

      // Assert: Fee record with id = 1
      // - takes 66.65 from payment B (id=24) - payment B now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 1,
          paymentId: 24,
        },
        {
          paymentAmountUsedForFeeRecord: 66.65,
        },
      );
      // - takes 44.46 from payment A (id=12) - payment A now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 1,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 44.46,
        },
      );
    });

    it('sets the paymentAmountUsedForFeeRecord by greedily splitting the payments across the fee records when the total payment amount is slightly greater than the total fee record amount', async () => {
      // Arrange
      const payments = [
        aPaymentWithIdAndAmount(12, 1012), // payment A
        aPaymentWithIdAndAmount(24, 66.65), // payment B
        aPaymentWithIdAndAmount(36, 600), // payment C
      ];

      const matchFeeRecords = [
        aFeeRecordWithIdAmountAndPayments(1, 111.11, payments),
        aFeeRecordWithIdAmountAndPayments(5, 555.55, payments),
        aFeeRecordWithIdAmountAndPayments(3, 333.33, payments),
        aFeeRecordWithIdAmountAndPayments(4, 444.44, payments),
        aFeeRecordWithIdAmountAndPayments(2, 222.22, payments),
      ];

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord(matchFeeRecords, mockEntityManager);

      // Assert: Fee record with id = 5
      // - takes 555.55 from payment A (id=12) - payment A now has 456.45 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 5,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 555.55,
        },
      );

      // Assert: Fee record with id = 4
      // - takes 444.44 from payment C (id=36) - payment C now has 155.56 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 4,
          paymentId: 36,
        },
        {
          paymentAmountUsedForFeeRecord: 444.44,
        },
      );

      // Assert: Fee record with id = 3
      // - takes 333.33 from payment A (id=12) - payment A now has 123.12 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 3,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 333.33,
        },
      );

      // Assert: Fee record with id = 2
      // - takes 155.56 from payment C (id=36) - payment C now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 2,
          paymentId: 36,
        },
        {
          paymentAmountUsedForFeeRecord: 155.56,
        },
      );
      // - takes 66.66 from payment A (id=12) - payment A now has 56.46 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 2,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 66.66,
        },
      );

      // Assert: Fee record with id = 1
      // - takes 66.65 from payment B (id=24) - payment B now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 1,
          paymentId: 24,
        },
        {
          paymentAmountUsedForFeeRecord: 66.65,
        },
      );
      // - takes 56.46 from payment A (id=12) - payment A now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 1,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 56.46,
        },
      );
    });

    it('sets the paymentAmountUsedForFeeRecord by greedily splitting the payments across the fee records when the total payment amount is slightly smaller than the total fee record amount', async () => {
      // Arrange
      const payments = [
        aPaymentWithIdAndAmount(12, 988), // payment A
        aPaymentWithIdAndAmount(24, 66.65), // payment B
        aPaymentWithIdAndAmount(36, 600), // payment C
      ];

      const matchFeeRecords = [
        aFeeRecordWithIdAmountAndPayments(1, 111.11, payments),
        aFeeRecordWithIdAmountAndPayments(5, 555.55, payments),
        aFeeRecordWithIdAmountAndPayments(3, 333.33, payments),
        aFeeRecordWithIdAmountAndPayments(4, 444.44, payments),
        aFeeRecordWithIdAmountAndPayments(2, 222.22, payments),
      ];

      // Act
      await updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord(matchFeeRecords, mockEntityManager);

      // Assert: Fee record with id = 5
      // - takes 555.55 from payment A (id=12) - payment A now has 432.45 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 5,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 555.55,
        },
      );

      // Assert: Fee record with id = 4
      // - takes 444.44 from payment C (id=36) - payment C now has 155.56 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 4,
          paymentId: 36,
        },
        {
          paymentAmountUsedForFeeRecord: 444.44,
        },
      );

      // Assert: Fee record with id = 3
      // - takes 333.33 from payment A (id=12) - payment A now has 99.12 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 3,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 333.33,
        },
      );

      // Assert: Fee record with id = 2
      // - takes 155.56 from payment C (id=36) - payment C now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 2,
          paymentId: 36,
        },
        {
          paymentAmountUsedForFeeRecord: 155.56,
        },
      );
      // - takes 66.66 from payment A (id=12) - payment A now has 32.46 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 2,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 66.66,
        },
      );

      // Assert: Fee record with id = 1
      // - takes 66.65 from payment B (id=24) - payment B now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 1,
          paymentId: 24,
        },
        {
          paymentAmountUsedForFeeRecord: 66.65,
        },
      );
      // - takes 32.46 from payment A (id=12) - payment A now has 0 remaining
      expect(mockUpdate).toHaveBeenCalledWith(
        FeeRecordPaymentJoinTableEntity,
        {
          feeRecordId: 1,
          paymentId: 12,
        },
        {
          paymentAmountUsedForFeeRecord: 32.46,
        },
      );
    });
  });

  function aUtilisationReport() {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});
