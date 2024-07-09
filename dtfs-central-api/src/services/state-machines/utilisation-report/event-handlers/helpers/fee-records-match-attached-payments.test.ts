import { EntityManager } from 'typeorm';
import { when } from 'jest-when';
import { Currency, FeeRecordEntity, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { feeRecordsMatchAttachedPayments } from './fee-records-match-attached-payments';

describe('feeRecordsMatchAttachedPayments', () => {
  const mockFindOneOrFail = jest.fn();
  const mockEntityManager = {
    findOneOrFail: mockFindOneOrFail,
  } as unknown as EntityManager;

  beforeEach(() => {
    mockFindOneOrFail.mockRejectedValue(new Error('Some error'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns true when the payments attached to the fee records have the same total payments', async () => {
    // Arrange
    const paymentCurrency: Currency = 'GBP';
    const firstFeeRecordAmount = 100;
    const secondFeeRecordAmount = 50;
    const firstPaymentAmount = 30;
    const secondPaymentAmount = 120;

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const payments = [
      PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(firstPaymentAmount).build(),
      PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(secondPaymentAmount).build(),
    ];

    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withId(1)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
        .withPayments(payments)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withId(2)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
        .withPayments(payments)
        .build(),
    ];

    when(mockFindOneOrFail)
      .calledWith(FeeRecordEntity, {
        where: { id: feeRecords[0].id },
        relations: { payments: true },
      })
      .mockResolvedValue(feeRecords[0]);

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

    const payments = [
      PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(firstPaymentAmount).build(),
      PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(secondPaymentAmount).build(),
    ];

    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withId(1)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
        .withPayments(payments)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withId(2)
        .withPaymentCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
        .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
        .withPayments(payments)
        .build(),
    ];

    when(mockFindOneOrFail)
      .calledWith(FeeRecordEntity, {
        where: { id: feeRecords[0].id },
        relations: { payments: true },
      })
      .mockResolvedValue(feeRecords[0]);

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

    const payments = [
      PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(firstPaymentAmount).build(),
      PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(secondPaymentAmount).build(),
    ];

    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withId(1)
        .withPaymentCurrency(paymentCurrency)
        .withPaymentExchangeRate(paymentExchangeRate)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
        .withPayments(payments)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withId(2)
        .withPaymentCurrency(paymentCurrency)
        .withPaymentExchangeRate(paymentExchangeRate)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
        .withPayments(payments)
        .build(),
    ];

    when(mockFindOneOrFail)
      .calledWith(FeeRecordEntity, {
        where: { id: feeRecords[0].id },
        relations: { payments: true },
      })
      .mockResolvedValue(feeRecords[0]);

    // Act
    const result = await feeRecordsMatchAttachedPayments(feeRecords, mockEntityManager);

    // Assert
    expect(result).toBe(true);
  });
});
