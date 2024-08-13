import Big from 'big.js';
import { FeeRecordEntity, FeeRecordStatus, KeyingSheetAdjustment } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../../../../../helpers';
import { KeyingSheet, KeyingSheetRow } from '../../../../../types/fee-records';
import { mapFeeRecordEntityToKeyingSheetRowStatus, mapFeeRecordEntityToReportedPayments } from '../../../../../mapping/fee-record-mapper';

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

const mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments = (feeRecordEntity: FeeRecordEntity): Omit<KeyingSheetRow, 'feePayments'> => ({
  feeRecordId: feeRecordEntity.id,
  status: mapFeeRecordEntityToKeyingSheetRowStatus(feeRecordEntity),
  facilityId: feeRecordEntity.facilityId,
  exporter: feeRecordEntity.exporter,
  baseCurrency: feeRecordEntity.baseCurrency,
  fixedFeeAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.fixedFeeAdjustment),
  principalBalanceAdjustment: getKeyingSheetAdjustmentForAmount(feeRecordEntity.principalBalanceAdjustment),
});

const STATUSES_OF_FEE_RECORDS_TO_DISPLAY_ON_KEYING_SHEET: FeeRecordStatus[] = ['READY_TO_KEY', 'RECONCILED'];

const getZeroAmountKeyingSheetFeePayment = ({ paymentCurrency }: FeeRecordEntity) => ({
  currency: paymentCurrency,
  amount: 0,
  dateReceived: null,
});

const mapFeeRecordPaymentEntityGroupToKeyingSheetRows = ({ feeRecords, payments }: FeeRecordPaymentEntityGroup): KeyingSheetRow[] => {
  if (feeRecords.length === 1) {
    const feePayments =
      payments.length > 0
        ? payments.map(({ currency, amount, dateReceived }) => ({ currency, amount, dateReceived }))
        : [getZeroAmountKeyingSheetFeePayment(feeRecords[0])];
    return [{ ...mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecords[0]), feePayments }];
  }

  const { dateReceived } = payments[0];
  return feeRecords.map((feeRecord) => ({
    ...mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecord),
    feePayments: [
      {
        ...mapFeeRecordEntityToReportedPayments(feeRecord),
        dateReceived,
      },
    ],
  }));
};

/**
 * Maps the fee record payment entity groups to the keying sheet
 * @param feeRecordPaymentEntityGroups - The grouped fee record and payment entities
 * @returns The keying sheet
 */
export const mapFeeRecordPaymentEntityGroupsToKeyingSheet = (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[]): KeyingSheet =>
  feeRecordPaymentEntityGroups
    .filter(({ feeRecords }) => feeRecords.every(({ status }) => STATUSES_OF_FEE_RECORDS_TO_DISPLAY_ON_KEYING_SHEET.includes(status)))
    .reduce(
      (keyingSheet, feeRecordPaymentGroup) => [...keyingSheet, ...mapFeeRecordPaymentEntityGroupToKeyingSheetRows(feeRecordPaymentGroup)],
      [] as KeyingSheet,
    );
