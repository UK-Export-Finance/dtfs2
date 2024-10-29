import { FEE_RECORD_STATUS, FeeRecordEntity, KEYING_SHEET_ROW_STATUS, KeyingSheetAdjustment, KeyingSheetRowStatus, PaymentEntity } from '@ukef/dtfs2-common';
import Big from 'big.js';
import { KeyingSheetFeePayment, KeyingSheetRow } from '../types/fee-records';

const mapFeeRecordEntityToKeyingSheetRowStatus = (feeRecord: FeeRecordEntity): KeyingSheetRowStatus => {
  switch (feeRecord.status) {
    case FEE_RECORD_STATUS.READY_TO_KEY:
      return KEYING_SHEET_ROW_STATUS.TO_DO;
    case FEE_RECORD_STATUS.RECONCILED:
      return KEYING_SHEET_ROW_STATUS.DONE;
    default:
      throw new Error(`Cannot get keying sheet status for fee record with status '${feeRecord.status}'`);
  }
};

const getKeyingSheetAdjustmentForAmount = (amount: number | null): KeyingSheetAdjustment | null => {
  if (amount === null) {
    return null;
  }

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
 * Maps a fee record entity to a keying sheet row without any fee payments
 * @param feeRecordEntity - The fee record entity
 * @returns The keying sheet row (without fee payments)
 */
export const mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments = (feeRecordEntity: FeeRecordEntity): Omit<KeyingSheetRow, 'feePayments'> => ({
  feeRecordId: feeRecordEntity.id,
  status: mapFeeRecordEntityToKeyingSheetRowStatus(feeRecordEntity),
  facilityId: feeRecordEntity.facilityId,
  exporter: feeRecordEntity.exporter,
  baseCurrency: feeRecordEntity.baseCurrency,
  fixedFeeAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.fixedFeeAdjustment),
  principalBalanceAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.principalBalanceAdjustment),
});

/**
 * Maps a payment entity to a keying sheet fee payment
 * @param paymentEntity - The payment entity
 * @returns The fee payment
 */
export const mapPaymentEntityToKeyingSheetFeePayment = (paymentEntity: PaymentEntity): KeyingSheetFeePayment => ({
  dateReceived: paymentEntity.dateReceived,
  amount: paymentEntity.amount,
  currency: paymentEntity.currency,
});
