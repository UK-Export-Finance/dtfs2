import { CurrencyAndAmount, FeeRecordEntity } from '@ukef/dtfs2-common';
import { FeeRecord } from '../types/fee-records';

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
 * Maps the fee record entity to the fee record
 * @param feeRecord - The fee record entity
 * @returns The fee record
 */
export const mapFeeRecordEntityToFeeRecord = (feeRecord: FeeRecordEntity): FeeRecord => ({
  id: feeRecord.id,
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFees: mapFeeRecordEntityToReportedFees(feeRecord),
  reportedPayments: mapFeeRecordEntityToReportedPayments(feeRecord),
});
