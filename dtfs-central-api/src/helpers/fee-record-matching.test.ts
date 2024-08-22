import {
  Currency,
  CURRENCY,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  PaymentMatchingToleranceEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';
import { feeRecordsAndPaymentsMatch } from './fee-record-matching';
import { PaymentMatchingToleranceRepo } from '../repositories/payment-matching-tolerance-repo';
import { NotFoundError } from '../errors';

jest.mock('../repositories/payment-matching-tolerance-repo');

describe('fee-record-matching', () => {
  const mockEntityManager = {} as unknown as EntityManager;
  const mockFindOneByCurrencyAndIsActiveTrue = jest.fn();

  beforeEach(() => {
    jest.spyOn(PaymentMatchingToleranceRepo, 'withTransaction').mockReturnValue({ findOneByCurrencyAndIsActiveTrue: mockFindOneByCurrencyAndIsActiveTrue });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('feeRecordsAndPaymentsMatch', () => {
    it('throws an error if no fee records are provided', async () => {
      // Arrange
      const feeRecords: FeeRecordEntity[] = [];
      const payments: PaymentEntity[] = [];

      // Act + Assert
      await expect(feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager)).rejects.toThrow();
    });

    it('throws an error if no active tolerance found for currency', async () => {
      // Arrange
      const feeRecords = getFeeRecordsWithReportedPayments([100], 'GBP');
      const payments: PaymentEntity[] = [];

      mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(null);

      // Act + Assert
      await expect(feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager)).rejects.toThrow(NotFoundError);
    });

    it('fetches payment matching tolerance within the transaction', async () => {
      // Arrange
      const feeRecords = getFeeRecordsWithReportedPayments([100], 'GBP');
      const payments: PaymentEntity[] = [];

      mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').build());
      const withTransactionSpy = jest
        .spyOn(PaymentMatchingToleranceRepo, 'withTransaction')
        .mockReturnValue({ findOneByCurrencyAndIsActiveTrue: mockFindOneByCurrencyAndIsActiveTrue });

      // Act
      await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

      // Assert
      expect(withTransactionSpy).toHaveBeenCalledTimes(1);
      expect(withTransactionSpy).toHaveBeenCalledWith(mockEntityManager);
    });

    it.each(Object.values(CURRENCY))('uses fee record payment currency to fetch tolerance (currency: %s)', async (currency: Currency) => {
      // Arrange
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
          .withPaymentCurrency(currency)
          .build(),
      ];
      const payments: PaymentEntity[] = [];

      mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(PaymentMatchingToleranceEntityMockBuilder.forCurrency(currency).build());

      // Act
      await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

      // Assert
      expect(mockFindOneByCurrencyAndIsActiveTrue).toHaveBeenCalledTimes(1);
      expect(mockFindOneByCurrencyAndIsActiveTrue).toHaveBeenCalledWith(currency);
    });

    describe('when the tolerance is zero', () => {
      it.each(Object.values(CURRENCY))(
        'returns true if the difference between the received payments and reported payments is zero (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const firstFeeRecordAmount = 100;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 30;
          const secondPaymentAmount = 120;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(0).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(true);
        },
      );

      it.each(Object.values(CURRENCY))(
        'returns false if the total received payments is greater than the total reported payments (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const firstFeeRecordAmount = 100000;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 100000.01;
          const secondPaymentAmount = 50;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(0).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(false);
        },
      );

      it.each(Object.values(CURRENCY))(
        'returns false if the total received payments is less than the total reported payments (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const firstFeeRecordAmount = 100000.01;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 100000;
          const secondPaymentAmount = 50;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(0).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(false);
        },
      );

      it('returns true if fee record payment amount is zero and there are no payments', async () => {
        // Arrange
        const feeRecords = getFeeRecordsWithReportedPayments([0], 'GBP');
        const payments: PaymentEntity[] = [];

        mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').withThreshold(0).build());

        // Act
        const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

        // Assert
        expect(result).toBe(true);
      });

      it('returns false if fee record payment amount is non-zero and there are no payments', async () => {
        // Arrange
        const feeRecords = getFeeRecordsWithReportedPayments([0.01], 'GBP');
        const payments: PaymentEntity[] = [];

        mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').withThreshold(0).build());

        // Act
        const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

        // Assert
        expect(result).toBe(false);
      });

      describe('and when the payment currency and fees paid currency do not match', () => {
        it.each`
          condition            | expectedResult | paymentAmount
          ${'equals'}          | ${true}        | ${95.91}
          ${'is less than'}    | ${false}       | ${95.9}
          ${'is greater than'} | ${false}       | ${95.92}
        `(
          'returns $expectedResult if total received payments $condition the total reported payments with the reported payments converted into the payment currency',
          async ({ expectedResult, paymentAmount }: { expectedResult: boolean; paymentAmount: number }) => {
            // Arrange
            const firstFeeRecordFeesPaidToUkefForThePeriodCurrency: Currency = 'EUR';
            const firstFeeRecordPaymentExchangeRate = 1.1;
            const firstFeeRecordAmount = 100; // = 90.91 USD

            const secondFeeRecordFeesPaidToUkefForThePeriodCurrency: Currency = 'JPY';
            const secondFeeRecordPaymentExchangeRate = 200;
            const secondFeeRecordAmount = 1000; // = 5 USD

            const paymentCurrency: Currency = 'USD';

            const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
            const feeRecords = [
              FeeRecordEntityMockBuilder.forReport(utilisationReport)
                .withPaymentCurrency(paymentCurrency)
                .withPaymentExchangeRate(firstFeeRecordPaymentExchangeRate)
                .withFeesPaidToUkefForThePeriodCurrency(firstFeeRecordFeesPaidToUkefForThePeriodCurrency)
                .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
                .build(),
              FeeRecordEntityMockBuilder.forReport(utilisationReport)
                .withPaymentCurrency(paymentCurrency)
                .withPaymentExchangeRate(secondFeeRecordPaymentExchangeRate)
                .withFeesPaidToUkefForThePeriodCurrency(secondFeeRecordFeesPaidToUkefForThePeriodCurrency)
                .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
                .build(),
            ];

            const payments = [PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(paymentAmount).build()];

            mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
              PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(0).build(),
            );

            // Act
            const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

            // Assert
            expect(result).toBe(expectedResult);
          },
        );

        it('returns true if fee record payment amount is zero after conversion to payment currency and there are no payments', async () => {
          // Arrange
          const paymentCurrency = 'USD';
          const feesPaidCurrency = 'JPY';
          // 0.1 / 200 = 0.0005 = 0 (to 2 decimal places)
          const feesPaidAmount = 0.1;
          const exchangeRate = 200;
          const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
          const feeRecords = [
            FeeRecordEntityMockBuilder.forReport(utilisationReport)
              .withId(1)
              .withPaymentCurrency(paymentCurrency)
              .withPaymentExchangeRate(exchangeRate)
              .withFeesPaidToUkefForThePeriodCurrency(feesPaidCurrency)
              .withFeesPaidToUkefForThePeriod(feesPaidAmount)
              .build(),
          ];
          const payments: PaymentEntity[] = [];

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(0).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(true);
        });

        it('returns false if fee record payment amount is zero after conversion to payment currency and there are no payments', async () => {
          // Arrange
          const paymentCurrency = 'USD';
          const feesPaidCurrency = 'JPY';
          // 1 / 200 = 0.005 = 0.1 (to 2 decimal places)
          const feesPaidAmount = 1;
          const exchangeRate = 200;
          const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
          const feeRecords = [
            FeeRecordEntityMockBuilder.forReport(utilisationReport)
              .withId(1)
              .withPaymentCurrency(paymentCurrency)
              .withPaymentExchangeRate(exchangeRate)
              .withFeesPaidToUkefForThePeriodCurrency(feesPaidCurrency)
              .withFeesPaidToUkefForThePeriod(feesPaidAmount)
              .build(),
          ];
          const payments: PaymentEntity[] = [];

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(0).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(false);
        });
      });
    });

    describe('when the tolerance is non-zero', () => {
      it.each(Object.values(CURRENCY))(
        'returns true if the received payments are greater than the reported payments by an amount equal to the tolerance (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const tolerance = 1.25;
          const firstFeeRecordAmount = 100;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 50;
          const secondPaymentAmount = 101.25;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(true);
        },
      );

      it.each(Object.values(CURRENCY))(
        'returns true if the received payments are less than the reported payments by an amount equal to the tolerance (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const tolerance = 1.37;
          const firstFeeRecordAmount = 101.37;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 50;
          const secondPaymentAmount = 100;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(true);
        },
      );

      it.each(Object.values(CURRENCY))(
        'returns false if the total received payments is greater than the total reported payments by an amount greater than the tolerance (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const tolerance = 1;
          const firstFeeRecordAmount = 100000;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 100001.01;
          const secondPaymentAmount = 50;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(false);
        },
      );

      it.each(Object.values(CURRENCY))(
        'returns false if the total received payments is less than the total reported payments by an amount greater than the tolerance (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const tolerance = 2.5;
          const firstFeeRecordAmount = 100002.51;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 100000;
          const secondPaymentAmount = 50;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(false);
        },
      );

      it.each(Object.values(CURRENCY))(
        'returns true if the total received payments is less than the total reported payments by an amount less than the tolerance (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const tolerance = 2.5;
          const firstFeeRecordAmount = 100002.49;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 100000;
          const secondPaymentAmount = 50;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(true);
        },
      );

      it.each(Object.values(CURRENCY))(
        'returns true if the total received payments is greater than the total reported payments by an amount less than the tolerance (currency: %s)',
        async (paymentCurrency: Currency) => {
          // Arrange
          const tolerance = 1;
          const firstFeeRecordAmount = 100000;
          const secondFeeRecordAmount = 50;
          const firstPaymentAmount = 100000.99;
          const secondPaymentAmount = 50;

          const feeRecords = getFeeRecordsWithReportedPayments([firstFeeRecordAmount, secondFeeRecordAmount], paymentCurrency);
          const payments = getPaymentsWithAmounts([firstPaymentAmount, secondPaymentAmount], paymentCurrency);

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(true);
        },
      );

      it('returns true if fee record payment amount does not exceed the tolerance and there are no payments', async () => {
        // Arrange
        const tolerance = 3;
        const feeRecords = getFeeRecordsWithReportedPayments([tolerance], 'GBP');
        const payments: PaymentEntity[] = [];

        mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').withThreshold(tolerance).build());

        // Act
        const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

        // Assert
        expect(result).toBe(true);
      });

      it('returns false if fee record payment amount exceeds the tolerance and there are no payments', async () => {
        // Arrange
        const tolerance = 3;
        const feeRecords = getFeeRecordsWithReportedPayments([3.01], 'GBP');
        const payments: PaymentEntity[] = [];

        mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').withThreshold(tolerance).build());

        // Act
        const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

        // Assert
        expect(result).toBe(false);
      });

      describe('and when the payment currency and fees paid to ukef currency do not match', () => {
        it('returns true if fee record payment amount does not exceed the tolerance after conversion to payment currency and there are no payments', async () => {
          // Arrange
          const tolerance = 3;
          const paymentCurrency = 'USD';
          const feesPaidCurrency = 'JPY';
          // 600.1 / 200 = 3.00005, rounded to 2 decimal places = 3 = tolerance
          const feesPaidAmount = 600.1;
          const exchangeRate = 200;
          const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
          const feeRecords = [
            FeeRecordEntityMockBuilder.forReport(utilisationReport)
              .withId(1)
              .withPaymentCurrency(paymentCurrency)
              .withPaymentExchangeRate(exchangeRate)
              .withFeesPaidToUkefForThePeriodCurrency(feesPaidCurrency)
              .withFeesPaidToUkefForThePeriod(feesPaidAmount)
              .build(),
          ];
          const payments: PaymentEntity[] = [];

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(true);
        });

        it('returns false if fee record payment amount exceeds the tolerance after conversion to payment currency and there are no payments', async () => {
          // Arrange
          const tolerance = 3;
          const paymentCurrency = 'USD';
          const feesPaidCurrency = 'JPY';
          // 601 / 200 = 3.005, rounded to 2 decimal places = 3.01 > tolerance
          const feesPaidAmount = 601;
          const exchangeRate = 200;
          const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
          const feeRecords = [
            FeeRecordEntityMockBuilder.forReport(utilisationReport)
              .withId(1)
              .withPaymentCurrency(paymentCurrency)
              .withPaymentExchangeRate(exchangeRate)
              .withFeesPaidToUkefForThePeriodCurrency(feesPaidCurrency)
              .withFeesPaidToUkefForThePeriod(feesPaidAmount)
              .build(),
          ];
          const payments: PaymentEntity[] = [];

          mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
            PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
          );

          // Act
          const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

          // Assert
          expect(result).toBe(false);
        });

        it.each`
          condition      | expectedResult | paymentAmount
          ${'less than'} | ${true}        | ${96.9}
          ${'more than'} | ${false}       | ${96.92}
          ${'equal to'}  | ${true}        | ${96.91}
        `(
          'returns $expectedResult if received payments are greater than the reported payments converted to payment currency by an amount $condition the tolerance',
          async ({ expectedResult, paymentAmount }: { expectedResult: boolean; paymentAmount: number }) => {
            // Arrange
            const tolerance = 1;
            const firstFeeRecordFeesPaidToUkefForThePeriodCurrency: Currency = 'EUR';
            const firstFeeRecordPaymentExchangeRate = 1.1;
            const firstFeeRecordAmount = 100; // = 90.91 GBP

            const secondFeeRecordFeesPaidToUkefForThePeriodCurrency: Currency = 'JPY';
            const secondFeeRecordPaymentExchangeRate = 200;
            const secondFeeRecordAmount = 1000; // = 5 GBP

            const paymentCurrency: Currency = 'GBP';

            const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
            const feeRecords = [
              FeeRecordEntityMockBuilder.forReport(utilisationReport)
                .withId(1)
                .withPaymentCurrency(paymentCurrency)
                .withPaymentExchangeRate(firstFeeRecordPaymentExchangeRate)
                .withFeesPaidToUkefForThePeriodCurrency(firstFeeRecordFeesPaidToUkefForThePeriodCurrency)
                .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
                .build(),
              FeeRecordEntityMockBuilder.forReport(utilisationReport)
                .withId(2)
                .withPaymentCurrency(paymentCurrency)
                .withPaymentExchangeRate(secondFeeRecordPaymentExchangeRate)
                .withFeesPaidToUkefForThePeriodCurrency(secondFeeRecordFeesPaidToUkefForThePeriodCurrency)
                .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
                .build(),
            ];

            const payments = [PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(paymentAmount).build()];

            mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
              PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
            );

            // Act
            const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

            // Assert
            expect(result).toBe(expectedResult);
          },
        );

        it.each`
          condition      | expectedResult | paymentAmount
          ${'less than'} | ${true}        | ${94.92}
          ${'more than'} | ${false}       | ${94.9}
          ${'equal to'}  | ${true}        | ${94.91}
        `(
          'returns $expectedResult if received payments are less than reported payments converted to payment currency by an amount $condition the tolerance',
          async ({ expectedResult, paymentAmount }: { expectedResult: boolean; paymentAmount: number }) => {
            // Arrange
            const tolerance = 1;
            const firstFeeRecordFeesPaidToUkefForThePeriodCurrency: Currency = 'EUR';
            const firstFeeRecordPaymentExchangeRate = 1.1;
            const firstFeeRecordAmount = 100; // = 90.91 GBP

            const secondFeeRecordFeesPaidToUkefForThePeriodCurrency: Currency = 'JPY';
            const secondFeeRecordPaymentExchangeRate = 200;
            const secondFeeRecordAmount = 1000; // = 5 GBP

            const paymentCurrency: Currency = 'GBP';

            const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
            const feeRecords = [
              FeeRecordEntityMockBuilder.forReport(utilisationReport)
                .withId(1)
                .withPaymentCurrency(paymentCurrency)
                .withPaymentExchangeRate(firstFeeRecordPaymentExchangeRate)
                .withFeesPaidToUkefForThePeriodCurrency(firstFeeRecordFeesPaidToUkefForThePeriodCurrency)
                .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
                .build(),
              FeeRecordEntityMockBuilder.forReport(utilisationReport)
                .withId(2)
                .withPaymentCurrency(paymentCurrency)
                .withPaymentExchangeRate(secondFeeRecordPaymentExchangeRate)
                .withFeesPaidToUkefForThePeriodCurrency(secondFeeRecordFeesPaidToUkefForThePeriodCurrency)
                .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
                .build(),
            ];

            const payments = [PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(paymentAmount).build()];

            mockFindOneByCurrencyAndIsActiveTrue.mockResolvedValue(
              PaymentMatchingToleranceEntityMockBuilder.forCurrency(paymentCurrency).withThreshold(tolerance).build(),
            );

            // Act
            const result = await feeRecordsAndPaymentsMatch(feeRecords, payments, mockEntityManager);

            // Assert
            expect(result).toBe(expectedResult);
          },
        );
      });
    });
  });

  function getFeeRecordsWithReportedPayments(reportedPaymentAmounts: number[], paymentCurrency: Currency): FeeRecordEntity[] {
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
    return reportedPaymentAmounts.map((paymentAmount) =>
      FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(paymentAmount)
        .build(),
    );
  }

  function getPaymentsWithAmounts(receivedPaymentAmounts: number[], paymentCurrency: Currency): PaymentEntity[] {
    return receivedPaymentAmounts.map((paymentAmount) => PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(paymentAmount).build());
  }
});
