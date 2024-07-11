import Big from 'big.js';
import { FeeRecordEntity, FeeRecordStatus, PaymentEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../../../../../helpers';
import { KeyingSheet, KeyingSheetAdjustment, KeyingSheetItem } from '../../../../../types/fee-records';
import { mapFeeRecordEntityToKeyingSheetStatus, mapFeeRecordEntityToReportedPayments } from '../../../../../mapping/fee-record-mapper';

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

const mapFeeRecordEntityToKeyingSheetItemWithPayments = (feeRecordEntity: FeeRecordEntity, paymentEntities: PaymentEntity[]): KeyingSheetItem => ({
  feeRecordId: feeRecordEntity.id,
  status: mapFeeRecordEntityToKeyingSheetStatus(feeRecordEntity),
  facilityId: feeRecordEntity.facilityId,
  exporter: feeRecordEntity.exporter,
  feePayments: paymentEntities.map(({ currency, amount, dateReceived }) => ({ currency, amount, dateReceived })),
  baseCurrency: feeRecordEntity.baseCurrency,
  fixedFeeAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.fixedFeeAdjustment),
  premiumAccrualBalanceAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.premiumAccrualBalanceAdjustment),
  principalBalanceAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.principalBalanceAdjustment),
});

const mapFeeRecordEntitiesToKeyingSheetWithDatePaymentReceived = (feeRecordEntities: FeeRecordEntity[], datePaymentReceived: Date): KeyingSheet =>
  feeRecordEntities.map((feeRecordEntity) => ({
    feeRecordId: feeRecordEntity.id,
    status: mapFeeRecordEntityToKeyingSheetStatus(feeRecordEntity),
    facilityId: feeRecordEntity.facilityId,
    exporter: feeRecordEntity.exporter,
    feePayments: [
      {
        ...mapFeeRecordEntityToReportedPayments(feeRecordEntity),
        dateReceived: datePaymentReceived,
      },
    ],
    baseCurrency: feeRecordEntity.baseCurrency,
    fixedFeeAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.fixedFeeAdjustment),
    premiumAccrualBalanceAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.premiumAccrualBalanceAdjustment),
    principalBalanceAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.principalBalanceAdjustment),
  }));

const VALID_FEE_RECORD_STATUSES: FeeRecordStatus[] = ['READY_TO_KEY', 'RECONCILED'];

/**
 * Maps the fee record payment entity groups to the keying sheet
 * @param feeRecordPaymentEntityGroups - The grouped fee record and payment entities
 * @returns The keying sheet
 */
export const mapFeeRecordPaymentEntityGroupsToKeyingSheet = (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[]): KeyingSheet =>
  feeRecordPaymentEntityGroups
    .filter(({ feeRecords }) => feeRecords.every(({ status }) => VALID_FEE_RECORD_STATUSES.includes(status)))
    .reduce((keyingSheet, { feeRecords, payments }) => {
      if (feeRecords.length === 1) {
        return [...keyingSheet, mapFeeRecordEntityToKeyingSheetItemWithPayments(feeRecords[0], payments)];
      }
      const datePaymentReceived = payments[0].dateReceived;
      return [...keyingSheet, ...mapFeeRecordEntitiesToKeyingSheetWithDatePaymentReceived(feeRecords, datePaymentReceived)];
    }, [] as KeyingSheet);
