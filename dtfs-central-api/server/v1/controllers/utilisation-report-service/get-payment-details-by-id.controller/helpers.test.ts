import {
  Currency,
  CurrencyAndAmount,
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  ReportPeriod,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { mapToPaymentDetails } from './helpers';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { Payment } from '../../../../types/payments';
import { FeeRecord } from '../../../../types/fee-records';

jest.mock('../../../../repositories/banks-repo');

describe('get-payment.controller helpers', () => {
  describe('mapToPaymentDetails', () => {
    const bankId = '123';

    const paymentCurrency: Currency = CURRENCY.GBP;

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withBankId(bankId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).build();

    const aPayment = (): PaymentEntity => PaymentEntityMockBuilder.forCurrency(paymentCurrency).withFeeRecords([feeRecord]).build();

    beforeEach(() => {
      jest.mocked(getBankNameById).mockResolvedValue('Some bank name');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('throws the NotFoundError when the bank name for the supplied bank id cannot be found', async () => {
      // Arrange
      const payment = aPayment();

      jest.mocked(getBankNameById).mockResolvedValue(undefined);

      // Act / Assert
      await expect(mapToPaymentDetails(payment, false)).rejects.toThrow(NotFoundError);
      expect(getBankNameById).toHaveBeenCalledWith(bankId);
    });

    it('returns an object containing the bank', async () => {
      // Arrange
      const payment = aPayment();

      const bankName = 'Test bank';
      jest.mocked(getBankNameById).mockResolvedValue(bankName);

      // Act
      const paymentDetails = await mapToPaymentDetails(payment, false);

      // Assert
      expect(paymentDetails.bank).toEqual({ id: bankId, name: bankName });
    });

    it('returns an object containing the report period', async () => {
      // Arrange
      const reportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };
      const payment = aPayment();
      payment.feeRecords[0].report.reportPeriod = reportPeriod;

      // Act
      const paymentDetails = await mapToPaymentDetails(payment, false);

      // Assert
      expect(paymentDetails.reportPeriod).toEqual(reportPeriod);
    });

    it('returns an object containing the mapped payment', async () => {
      // Arrange
      const mappedPayment: Payment = {
        id: 1,
        currency: 'USD',
        amount: 100,
        dateReceived: new Date(),
        reference: 'A payment reference',
      };

      const payment = aPayment();

      payment.id = mappedPayment.id;
      payment.currency = mappedPayment.currency;
      payment.amount = mappedPayment.amount;
      payment.dateReceived = mappedPayment.dateReceived;
      payment.reference = mappedPayment.reference;

      // Act
      const paymentDetails = await mapToPaymentDetails(payment, false);

      // Assert
      expect(paymentDetails.payment).toEqual(mappedPayment);
    });

    describe('when includeFeeRecords is set to true', () => {
      const includeFeeRecords = true;

      it('returns an object containing the mapped fee records', async () => {
        // Arrange
        const payment = aPayment();

        const feeRecordEntities = [
          FeeRecordEntityMockBuilder.forReport(utilisationReport)
            .withId(1)
            .withFacilityId('12345678')
            .withExporter('Test exporter 1')
            .withPaymentCurrency(paymentCurrency)
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
            .build(),
          FeeRecordEntityMockBuilder.forReport(utilisationReport)
            .withId(2)
            .withFacilityId('87654321')
            .withExporter('Test exporter 2')
            .withPaymentCurrency(paymentCurrency)
            .withFeesPaidToUkefForThePeriod(200)
            .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
            .build(),
        ];
        payment.feeRecords = feeRecordEntities;

        const feeRecords: FeeRecord[] = [
          {
            id: 1,
            facilityId: '12345678',
            exporter: 'Test exporter 1',
            reportedFees: { currency: paymentCurrency, amount: 100 },
            reportedPayments: { currency: paymentCurrency, amount: 100 },
          },
          {
            id: 2,
            facilityId: '87654321',
            exporter: 'Test exporter 2',
            reportedFees: { currency: paymentCurrency, amount: 200 },
            reportedPayments: { currency: paymentCurrency, amount: 200 },
          },
        ];

        // Act
        const paymentDetails = await mapToPaymentDetails(payment, includeFeeRecords);

        // Assert
        expect(paymentDetails.feeRecords).toEqual(feeRecords);
      });

      it('returns an object containing the total reported payments', async () => {
        // Arrange
        const payment = aPayment();

        const feeRecordEntities = [
          FeeRecordEntityMockBuilder.forReport(utilisationReport)
            .withId(1)
            .withFacilityId('12345678')
            .withExporter('Test exporter 1')
            .withPaymentCurrency(paymentCurrency)
            .withFeesPaidToUkefForThePeriod(100)
            .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
            .build(),
          FeeRecordEntityMockBuilder.forReport(utilisationReport)
            .withId(2)
            .withFacilityId('87654321')
            .withExporter('Test exporter 2')
            .withPaymentCurrency(paymentCurrency)
            .withFeesPaidToUkefForThePeriod(200)
            .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
            .build(),
        ];
        payment.feeRecords = feeRecordEntities;

        const totalReportedPayments: CurrencyAndAmount = {
          currency: paymentCurrency,
          amount: 300,
        };

        // Act
        const paymentDetails = await mapToPaymentDetails(payment, includeFeeRecords);

        // Assert
        expect(paymentDetails.totalReportedPayments).toEqual(totalReportedPayments);
      });
    });

    describe('when includeFeeRecords is set to false', () => {
      const includeFeeRecords = false;

      it('returns an object which does not contain the fee records or the total reported payments', async () => {
        // Arrange
        const payment = aPayment();

        const feeRecordEntities = [
          FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build(),
          FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build(),
        ];
        payment.feeRecords = feeRecordEntities;

        // Act
        const paymentDetails = await mapToPaymentDetails(payment, includeFeeRecords);

        // Assert
        expect(paymentDetails.feeRecords).toBeUndefined();
        expect(paymentDetails.totalReportedPayments).toBeUndefined();
      });
    });
  });
});
