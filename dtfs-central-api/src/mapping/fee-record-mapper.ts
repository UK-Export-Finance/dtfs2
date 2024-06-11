import { CurrencyAndAmount, FeeRecordEntity } from '@ukef/dtfs2-common';
import Big from 'big.js';

/**
 * Maps the fee record entity to the reported fees
 * @param feeRecord - The fee record entity
 * @returns The reported fees
 */
export const mapFeeRecordEntityToReportedFees = (feeRecord: FeeRecordEntity): CurrencyAndAmount => ({
  currency: feeRecord.feesPaidToUkefForThePeriodCurrency,
  amount: feeRecord.feesPaidToUkefForThePeriod,
});

/**
 * Maps the fee record entity to the reported payments
 * @param feeRecord - The fee record entity
 * @returns The reported fees
 */
export const mapFeeRecordEntityToReportedPayments = (feeRecord: FeeRecordEntity): CurrencyAndAmount => {
  const { paymentCurrency, feesPaidToUkefForThePeriodCurrency, feesPaidToUkefForThePeriod } = feeRecord;

  if (paymentCurrency === feesPaidToUkefForThePeriodCurrency) {
    return {
      currency: paymentCurrency,
      amount: feesPaidToUkefForThePeriod,
    };
  }

  const feesPaidToUkefForThePeriodInPaymentCurrency = feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency();

  return {
    amount: feesPaidToUkefForThePeriodInPaymentCurrency,
    currency: paymentCurrency,
  };
};

/**
 * Maps a list of fee record entities to the total reported payments
 * @param feeRecords - The list of fee records
 * @returns The total reported payments
 */
export const mapFeeRecordEntitiesToTotalReportedPayments = (feeRecords: FeeRecordEntity[]): CurrencyAndAmount => {
  if (feeRecords.length === 0) {
    throw new Error('Cannot get total reported payments for empty fee record list');
  }

  const totalReportedPaymentsAmount = feeRecords
    .reduce((total, feeRecord) => total.add(feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency()), new Big(0))
    .toNumber();

  return {
    currency: feeRecords[0].paymentCurrency,
    amount: totalReportedPaymentsAmount,
  };
};
