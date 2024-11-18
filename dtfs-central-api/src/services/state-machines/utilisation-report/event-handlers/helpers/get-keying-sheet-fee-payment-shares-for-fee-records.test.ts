import {
  Currency,
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { KeyingSheetFeePaymentShare, getKeyingSheetFeePaymentSharesForFeeRecords } from './get-keying-sheet-fee-payment-shares-for-fee-records';

describe('getKeyingSheetFeePaymentSharesForFeeRecords', () => {
  describe('when there is one fee record linked to one payment', () => {
    it('creates one fee payment when the fee record amount exactly matches the payment amount', () => {
      // Arrange
      const paymentCurrency: Currency = CURRENCY.GBP;

      const paymentId = 123;
      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).withAmount(1000).build();

      const feeRecordId = 456;
      const matchFeeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withId(feeRecordId)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(1000)
        .withPayments([payment])
        .build();

      // Act
      const result = getKeyingSheetFeePaymentSharesForFeeRecords([matchFeeRecord]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId, feePaymentAmount: 1000 });
    });

    it.each([
      { condition: 'the fee record amount is greater than the payment amount', feeRecordAmount: 200, paymentAmount: 100 },
      { condition: 'the fee record amount is smaller than the payment amount', feeRecordAmount: 100, paymentAmount: 200 },
    ])('sets the fee payment amount to the payment amount when $condition', ({ paymentAmount, feeRecordAmount }) => {
      // Arrange
      const paymentCurrency: Currency = CURRENCY.GBP;

      const paymentId = 123;
      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).withAmount(paymentAmount).build();

      const feeRecordId = 456;
      const matchFeeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withId(feeRecordId)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(feeRecordAmount)
        .withPayments([payment])
        .build();

      // Act
      const result = getKeyingSheetFeePaymentSharesForFeeRecords([matchFeeRecord]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].feeRecordId).toEqual(feeRecordId);
      expect(result[0]).toEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId, feePaymentAmount: paymentAmount });
    });
  });

  describe('when there is a single bulk payment linked to many fee records', () => {
    const paymentCurrency: Currency = CURRENCY.GBP;
    const paymentId = 123;

    const aBulkPayment = () => PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).withAmount(1000).build();

    const aMatchFeeRecordWithIdAmountAndPayment = (id: number, amount: number, payment: PaymentEntity) =>
      FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withId(id)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(amount)
        .withPayments([payment])
        .build();

    it('creates a fee payment for each fee record with amount matching the fee record amount', () => {
      // Arrange
      const payment = aBulkPayment();

      const matchFeeRecords: FeeRecordEntity[] = [
        aMatchFeeRecordWithIdAmountAndPayment(12, 150, payment),
        aMatchFeeRecordWithIdAmountAndPayment(24, 800, payment),
        aMatchFeeRecordWithIdAmountAndPayment(36, 50, payment),
      ];

      // Act
      const result = getKeyingSheetFeePaymentSharesForFeeRecords(matchFeeRecords);

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ paymentId, feeRecordId: 12, feePaymentAmount: 150 });
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ paymentId, feeRecordId: 24, feePaymentAmount: 800 });
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ paymentId, feeRecordId: 36, feePaymentAmount: 50 });
    });

    describe('and when the total payment amount is different to the total fee record amount due to tolerance', () => {
      it('creates a fee payment for each fee record with the excess payment amount being linked to the fee record with the smallest amount when the total payments are greater', () => {
        // Arrange
        const payment = aBulkPayment();
        payment.amount = 2000;

        const matchFeeRecords: FeeRecordEntity[] = [
          aMatchFeeRecordWithIdAmountAndPayment(12, 150, payment),
          aMatchFeeRecordWithIdAmountAndPayment(24, 800, payment),
          aMatchFeeRecordWithIdAmountAndPayment(36, 50, payment),
        ];

        // Act
        const result = getKeyingSheetFeePaymentSharesForFeeRecords(matchFeeRecords);

        // Assert
        expect(result).toHaveLength(3);
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ paymentId, feeRecordId: 12, feePaymentAmount: 150 });
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ paymentId, feeRecordId: 24, feePaymentAmount: 800 });
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ paymentId, feeRecordId: 36, feePaymentAmount: 1050 }); // 2000 - 150 - 800
      });

      it('creates a fee payment for each fee record where the payment can be used to cover the fee record amount', () => {
        // Arrange
        const payment = aBulkPayment();
        payment.amount = 801;

        const matchFeeRecords: FeeRecordEntity[] = [
          aMatchFeeRecordWithIdAmountAndPayment(12, 150, payment),
          aMatchFeeRecordWithIdAmountAndPayment(24, 800, payment),
          aMatchFeeRecordWithIdAmountAndPayment(36, 50, payment), // no fee payment expected
        ];

        // Act
        const result = getKeyingSheetFeePaymentSharesForFeeRecords(matchFeeRecords);

        // Assert
        expect(result).toHaveLength(2);
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ paymentId, feeRecordId: 12, feePaymentAmount: 1 });
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ paymentId, feeRecordId: 24, feePaymentAmount: 800 });
      });
    });
  });

  describe('when there are many payments linked to one fee record', () => {
    it('creates a fee payment for each payment linked to the fee record with fee payment amount equal to the payment amount', () => {
      // Arrange
      const paymentCurrency: Currency = CURRENCY.GBP;

      const feeRecordId = 123;
      const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.MATCH)
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
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(thirdPaymentId).withAmount(100).build(),
      ];
      feeRecord.payments = payments;

      // Act
      const result = getKeyingSheetFeePaymentSharesForFeeRecords([feeRecord]);

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: firstPaymentId, feePaymentAmount: 800 });
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: secondPaymentId, feePaymentAmount: 100 });
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: thirdPaymentId, feePaymentAmount: 100 });
    });

    describe('and when the total payment amount is different to the total fee record amount due to tolerance', () => {
      it('creates a fee payment for each payment linked to the fee record when the total payment amount is greater', () => {
        // Arrange
        const paymentCurrency: Currency = CURRENCY.GBP;

        const feeRecordId = 123;
        const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
          .withStatus(FEE_RECORD_STATUS.MATCH)
          .withId(feeRecordId)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(0)
          .build();

        const payments: PaymentEntity[] = [
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(11).withAmount(100).build(),
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(22).withAmount(200).build(),
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(33).withAmount(300).build(),
        ];
        feeRecord.payments = payments;

        // Act
        const result = getKeyingSheetFeePaymentSharesForFeeRecords([feeRecord]);

        // Assert
        expect(result).toHaveLength(3);
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: 11, feePaymentAmount: 100 });
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: 22, feePaymentAmount: 200 });
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: 33, feePaymentAmount: 300 });
      });

      it('creates a fee payment for each payment linked to the fee record when the total payment amount is smaller', () => {
        // Arrange
        const paymentCurrency: Currency = CURRENCY.GBP;

        const feeRecordId = 123;
        const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
          .withStatus(FEE_RECORD_STATUS.MATCH)
          .withId(feeRecordId)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(1000)
          .build();

        const payments: PaymentEntity[] = [
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(11).withAmount(10).build(),
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(22).withAmount(20).build(),
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(33).withAmount(30).build(),
        ];
        feeRecord.payments = payments;

        // Act
        const result = getKeyingSheetFeePaymentSharesForFeeRecords([feeRecord]);

        // Assert
        expect(result).toHaveLength(3);
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: 11, feePaymentAmount: 10 });
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: 22, feePaymentAmount: 20 });
        expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId, paymentId: 33, feePaymentAmount: 30 });
      });
    });
  });

  describe('when there are many payments linked to many fee records', () => {
    const paymentCurrency: Currency = CURRENCY.GBP;

    const aFeeRecordWithIdAmountAndPayments = (id: number, amount: number, payments: PaymentEntity[]) =>
      FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withId(id)
        .withFeesPaidToUkefForThePeriod(amount)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withPayments(payments)
        .build();

    const aPaymentWithIdAndAmount = (id: number, amount: number) => PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(id).withAmount(amount).build();

    it('creates fee payments by greedily splitting the payments across the fee records', () => {
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
      const result = getKeyingSheetFeePaymentSharesForFeeRecords(matchFeeRecords);

      // Assert: Fee record with id = 5
      // - takes 555.55 from payment A (id=12) - payment A now has 444.45 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 5, paymentId: 12, feePaymentAmount: 555.55 });

      // Assert: Fee record with id = 4
      // - takes 444.44 from payment C (id=36) - payment C now has 155.56 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 4, paymentId: 36, feePaymentAmount: 444.44 });

      // Assert: Fee record with id = 3
      // - takes 333.33 from payment A (id=12) - payment A now has 111.12 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 3, paymentId: 12, feePaymentAmount: 333.33 });

      // Assert: Fee record with id = 2
      // - takes 155.56 from payment C (id=36) - payment C now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 2, paymentId: 36, feePaymentAmount: 155.56 });
      // - takes 66.66 from payment A (id=12) - payment A now has 44.46 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 2, paymentId: 12, feePaymentAmount: 66.66 });

      // Assert: Fee record with id = 1
      // - takes 66.65 from payment B (id=24) - payment B now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 1, paymentId: 24, feePaymentAmount: 66.65 });
      // - takes 44.46 from payment A (id=12) - payment A now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 1, paymentId: 12, feePaymentAmount: 44.46 });
    });

    it('creates fee payments by greedily splitting the payments across the fee records when the total payment amount is slightly greater than the total fee record amount', () => {
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
      const result = getKeyingSheetFeePaymentSharesForFeeRecords(matchFeeRecords);

      // Assert: Fee record with id = 5
      // - takes 555.55 from payment A (id=12) - payment A now has 456.45 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 5, paymentId: 12, feePaymentAmount: 555.55 });

      // Assert: Fee record with id = 4
      // - takes 444.44 from payment C (id=36) - payment C now has 155.56 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 4, paymentId: 36, feePaymentAmount: 444.44 });

      // Assert: Fee record with id = 3
      // - takes 333.33 from payment A (id=12) - payment A now has 123.12 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 3, paymentId: 12, feePaymentAmount: 333.33 });

      // Assert: Fee record with id = 2
      // - takes 155.56 from payment C (id=36) - payment C now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 2, paymentId: 36, feePaymentAmount: 155.56 });
      // - takes 66.66 from payment A (id=12) - payment A now has 56.46 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 2, paymentId: 12, feePaymentAmount: 66.66 });

      // Assert: Fee record with id = 1
      // - takes 66.65 from payment B (id=24) - payment B now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 1, paymentId: 24, feePaymentAmount: 66.65 });
      // - takes 56.46 from payment A (id=12) - payment A now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 1, paymentId: 12, feePaymentAmount: 56.46 });
    });

    it('creates fee payments by greedily splitting the payments across the fee records when the total payment amount is slightly smaller than the total fee record amount', () => {
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
      const result = getKeyingSheetFeePaymentSharesForFeeRecords(matchFeeRecords);

      // Assert: Fee record with id = 5
      // - takes 555.55 from payment A (id=12) - payment A now has 432.45 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 5, paymentId: 12, feePaymentAmount: 555.55 });

      // Assert: Fee record with id = 4
      // - takes 444.44 from payment C (id=36) - payment C now has 155.56 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 4, paymentId: 36, feePaymentAmount: 444.44 });

      // Assert: Fee record with id = 3
      // - takes 333.33 from payment A (id=12) - payment A now has 99.12 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 3, paymentId: 12, feePaymentAmount: 333.33 });

      // Assert: Fee record with id = 2
      // - takes 155.56 from payment C (id=36) - payment C now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 2, paymentId: 36, feePaymentAmount: 155.56 });
      // - takes 66.66 from payment A (id=12) - payment A now has 32.46 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 2, paymentId: 12, feePaymentAmount: 66.66 });

      // Assert: Fee record with id = 1
      // - takes 66.65 from payment B (id=24) - payment B now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 1, paymentId: 24, feePaymentAmount: 66.65 });
      // - takes 32.46 from payment A (id=12) - payment A now has 0 remaining
      expect(result).toContainEqual<KeyingSheetFeePaymentShare>({ feeRecordId: 1, paymentId: 12, feePaymentAmount: 32.46 });
    });
  });

  describe('when the fee records have no attached payments and have been automatically moved to the MATCH status', () => {
    it('does not return any fee payments', () => {
      // Arrange
      const matchFeeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withPayments([])
        .build();

      // Act
      const result = getKeyingSheetFeePaymentSharesForFeeRecords([matchFeeRecord]);

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
