import { faker } from '@faker-js/faker';
import { FeeRecordEntity, FeeRecordStatus, UtilisationReportEntity, Currency } from '@ukef/dtfs2-common';
import { getRandomCurrency, getRandomFinancialAmount, getExchangeRate } from '../helpers';

type CreateRandomFeeRecordForReportOverrides = {
  status?: FeeRecordStatus;
  facilityId?: string;
  exporter?: string;
  paymentCurrency?: Currency;
};

export const createRandomFeeRecordForReport = (report: UtilisationReportEntity, overrides: CreateRandomFeeRecordForReportOverrides = {}): FeeRecordEntity => {
  const feeRecord = new FeeRecordEntity();

  feeRecord.report = report;

  feeRecord.status = overrides.status ?? 'TO_DO';
  feeRecord.facilityId = overrides.facilityId ?? faker.string.numeric({ length: { min: 8, max: 10 } });
  feeRecord.exporter = overrides.exporter ?? faker.company.name();

  feeRecord.baseCurrency = getRandomCurrency();

  feeRecord.facilityUtilisation = getRandomFinancialAmount({ min: 10000000, max: 20000000 });

  const minimumAccrualAmount = feeRecord.facilityUtilisation * 0.005;
  const maximumAccrualAmount = feeRecord.facilityUtilisation * 0.01;

  feeRecord.totalFeesAccruedForThePeriod = getRandomFinancialAmount({ min: minimumAccrualAmount, max: maximumAccrualAmount });
  feeRecord.totalFeesAccruedForThePeriodCurrency = getRandomCurrency();
  feeRecord.totalFeesAccruedForThePeriodExchangeRate = getExchangeRate({
    from: feeRecord.baseCurrency,
    to: feeRecord.totalFeesAccruedForThePeriodCurrency,
  });

  feeRecord.feesPaidToUkefForThePeriod = feeRecord.totalFeesAccruedForThePeriod;
  feeRecord.feesPaidToUkefForThePeriodCurrency = feeRecord.totalFeesAccruedForThePeriodCurrency;

  feeRecord.paymentCurrency = overrides.paymentCurrency ?? getRandomCurrency();
  feeRecord.paymentExchangeRate = getExchangeRate({
    from: feeRecord.paymentCurrency,
    to: feeRecord.feesPaidToUkefForThePeriodCurrency,
  });

  feeRecord.fixedFeeAdjustment = null;
  feeRecord.principalBalanceAdjustment = null;

  feeRecord.reconciledByUserId = null;
  feeRecord.dateReconciled = null;

  feeRecord.updateLastUpdatedBy({ platform: 'SYSTEM' });

  return feeRecord;
};

export const createAutoMatchedZeroPaymentFeeRecordForReport = (report: UtilisationReportEntity): FeeRecordEntity => {
  const feeRecord = new FeeRecordEntity();

  feeRecord.report = report;

  feeRecord.status = 'MATCH';
  feeRecord.facilityId = faker.string.numeric({ length: { min: 8, max: 10 } });
  feeRecord.exporter = faker.company.name();

  feeRecord.baseCurrency = getRandomCurrency();

  feeRecord.facilityUtilisation = 0;

  feeRecord.totalFeesAccruedForThePeriod = 0;
  feeRecord.totalFeesAccruedForThePeriodCurrency = getRandomCurrency();
  feeRecord.totalFeesAccruedForThePeriodExchangeRate = getExchangeRate({
    from: feeRecord.baseCurrency,
    to: feeRecord.totalFeesAccruedForThePeriodCurrency,
  });

  feeRecord.feesPaidToUkefForThePeriod = 0;
  feeRecord.feesPaidToUkefForThePeriodCurrency = feeRecord.totalFeesAccruedForThePeriodCurrency;

  feeRecord.paymentCurrency = getRandomCurrency();
  feeRecord.paymentExchangeRate = getExchangeRate({
    from: feeRecord.paymentCurrency,
    to: feeRecord.feesPaidToUkefForThePeriodCurrency,
  });

  feeRecord.fixedFeeAdjustment = null;
  feeRecord.principalBalanceAdjustment = null;

  feeRecord.updateLastUpdatedBy({ platform: 'SYSTEM' });

  return feeRecord;
};

/**
 * Splits a larger number into random amounts that sum up to the supplied larger amount
 * @param totalAmount - The total amount
 * @param numberOfParts - The number of parts to split the total amount in to
 * @returns The random amounts
 */
export const splitAmountIntoRandomAmounts = (totalAmount: number, numberOfParts: number): number[] => {
  const getRemainderFromParts = (parts: number[]): number => totalAmount - parts.reduce((total, part) => total + part, 0);

  const parts: number[] = [];

  while (parts.length < numberOfParts - 1) {
    const currentRemainder = getRemainderFromParts(parts);
    const randomAmount = faker.number.float({ min: 0, max: currentRemainder, fractionDigits: 2 });
    parts.push(randomAmount);
  }

  const lastRemainder = getRemainderFromParts(parts);
  parts.push(lastRemainder);
  return parts;
};
