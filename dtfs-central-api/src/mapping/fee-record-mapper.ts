import Big from 'big.js';
import { CurrencyAndAmount, FeeRecordEntity, KeyingSheetStatus } from '@ukef/dtfs2-common';
import { FeeRecord, KeyingSheet, KeyingSheetAdjustment } from '../types/fee-records';

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

/**
 * Maps the fee record entity to the keying sheet status
 * @param feeRecord - The fee record entity
 * @returns The keying sheet status
 */
const mapFeeRecordEntityToKeyingSheetStatus = (feeRecord: FeeRecordEntity): KeyingSheetStatus => {
  switch (feeRecord.status) {
    case 'READY_TO_KEY':
      return 'TO_DO';
    case 'RECONCILED':
      return 'DONE';
    default:
      throw new Error(`Cannot get keying sheet status for fee record with status '${feeRecord.status}'`);
  }
};

const getKeyingSheetAdjustmentForAmount = (amount: number): KeyingSheetAdjustment => {
  const amountAbsoluteValue = new Big(amount).abs().toNumber();
  if (amountAbsoluteValue === 0) {
    return {
      amount: 0,
      change: 'NONE',
    };
  }

  return {
    amount: amountAbsoluteValue,
    change: amount > 0 ? 'INCREASE' : 'DECREASE',
  };
};

/**
 * Maps the fee record entity to the fixed fee adjustment
 * @param feeRecord - The fee record entity
 * @returns The fixed fee adjustment
 */
const mapFeeRecordEntityToFixedFeeAdjustment = (feeRecord: FeeRecordEntity): KeyingSheetAdjustment | null => {
  if (!feeRecord.fixedFeeAdjustment) {
    return null;
  }
  return getKeyingSheetAdjustmentForAmount(feeRecord.fixedFeeAdjustment);
};

/**
 * Maps the fee record entity to the premium accrual balance adjustment
 * @param feeRecord - The fee record entity
 * @returns The premium accrual balance adjustment
 */
const mapFeeRecordEntityToPremiumAccrualBalanceAdjustment = (feeRecord: FeeRecordEntity): KeyingSheetAdjustment | null => {
  if (!feeRecord.premiumAccrualBalanceAdjustment) {
    return null;
  }
  return getKeyingSheetAdjustmentForAmount(feeRecord.premiumAccrualBalanceAdjustment);
};

/**
 * Maps the fee record entity to the principal balance adjustment
 * @param feeRecord - The fee record entity
 * @returns The principal balance adjustment
 */
const mapFeeRecordEntityToPrincipalBalanceAdjustment = (feeRecord: FeeRecordEntity): KeyingSheetAdjustment | null => {
  if (!feeRecord.principalBalanceAdjustment) {
    return null;
  }
  return getKeyingSheetAdjustmentForAmount(feeRecord.principalBalanceAdjustment);
};

/**
 * Maps the list of fee record entities to the keying sheet
 * @param feeRecordEntities - The fee record entities
 * @returns The keying sheet
 */
export const mapFeeRecordEntitiesToKeyingSheet = (feeRecordEntities: FeeRecordEntity[]): KeyingSheet => {
  const keyingSheetFeeRecords = feeRecordEntities.filter(({ status }) => status === 'READY_TO_KEY' || status === 'RECONCILED');

  return keyingSheetFeeRecords.map((feeRecordEntity) => ({
    feeRecordId: feeRecordEntity.id,
    status: mapFeeRecordEntityToKeyingSheetStatus(feeRecordEntity),
    facilityId: feeRecordEntity.facilityId,
    exporter: feeRecordEntity.exporter,
    datePaymentReceived: feeRecordEntity.payments[0].dateReceived, // TODO FN-Is this correct?
    feePayment: mapFeeRecordEntityToReportedPayments(feeRecordEntity),
    baseCurrency: feeRecordEntity.baseCurrency,
    fixedFeeAdjustment: mapFeeRecordEntityToFixedFeeAdjustment(feeRecordEntity),
    premiumAccrualBalanceAdjustment: mapFeeRecordEntityToPremiumAccrualBalanceAdjustment(feeRecordEntity),
    principalBalanceAdjustment: mapFeeRecordEntityToPrincipalBalanceAdjustment(feeRecordEntity),
  }));
};
