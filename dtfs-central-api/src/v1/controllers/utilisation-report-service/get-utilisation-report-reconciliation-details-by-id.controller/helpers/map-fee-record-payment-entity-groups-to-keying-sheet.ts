import Big from 'big.js';
import { orderBy } from 'lodash';
import { FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../../../../../helpers';
import { KeyingSheet, KeyingSheetFeePayment, KeyingSheetRow } from '../../../../../types/fee-records';
import { mapFeeRecordEntityToReportedPayments } from '../../../../../mapping/fee-record-mapper';
import { mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments, mapPaymentEntityToKeyingSheetFeePayment } from '../../../../../mapping/keying-sheet-mapping';

const STATUSES_OF_FEE_RECORDS_TO_DISPLAY_ON_KEYING_SHEET: FeeRecordStatus[] = ['READY_TO_KEY', 'RECONCILED'];

/**
 * Creates keying sheet rows for fee record payment groups
 * with many fee records and many payments by greedily
 * splitting payment amounts across the fee record fees
 * sorted in descending order
 * @param param - The fee record payment entity groups
 * @param param.feeRecords - The fee record entities
 * @param param.payments - The payment entities
 * @returns The keying sheet
 */
const getKeyingSheetRowsWithPaymentsAcrossFeeRecords = ({ feeRecords, payments }: FeeRecordPaymentEntityGroup): KeyingSheetRow[] => {
  const feeRecordsSortedDescending = orderBy(feeRecords, [(feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency()], ['desc']);
  let allFeePaymentsSortedAscending = orderBy(payments, ['amount'], ['asc']).map(mapPaymentEntityToKeyingSheetFeePayment);

  return feeRecordsSortedDescending.map((feeRecord) => {
    const feePaymentsForRow: KeyingSheetFeePayment[] = [];
    let remainingFeeRecordAmount = new Big(feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency());
    while (remainingFeeRecordAmount.gt(0)) {
      const largestFeePayment = allFeePaymentsSortedAscending.pop()!;
      feePaymentsForRow.push(largestFeePayment);
      remainingFeeRecordAmount = remainingFeeRecordAmount.sub(largestFeePayment.amount);
    }

    if (remainingFeeRecordAmount.eq(0)) {
      return {
        ...mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecord),
        feePayments: feePaymentsForRow,
      };
    }

    const lastFeePayment = feePaymentsForRow.at(-1)!;
    const leftoverFeePaymentAmount = remainingFeeRecordAmount.mul(-1).toNumber();
    const lastFeePaymentAmountUsed = new Big(lastFeePayment.amount).add(remainingFeeRecordAmount).toNumber();

    lastFeePayment.amount = lastFeePaymentAmountUsed;

    const leftoverFeePayment: KeyingSheetFeePayment = {
      ...lastFeePayment,
      amount: leftoverFeePaymentAmount,
    };
    allFeePaymentsSortedAscending = orderBy([...allFeePaymentsSortedAscending, leftoverFeePayment], ['amount'], ['asc']);

    return {
      ...mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecord),
      feePayments: feePaymentsForRow,
    };
  });
};

const getZeroAmountKeyingSheetFeePayment = ({ paymentCurrency }: FeeRecordEntity): KeyingSheetFeePayment => ({
  currency: paymentCurrency,
  amount: 0,
  dateReceived: null,
});

const mapFeeRecordPaymentEntityGroupToKeyingSheetRows = ({ feeRecords, payments }: FeeRecordPaymentEntityGroup): KeyingSheetRow[] => {
  if (feeRecords.length === 1) {
    const feePayments = payments.length > 0 ? payments.map(mapPaymentEntityToKeyingSheetFeePayment) : [getZeroAmountKeyingSheetFeePayment(feeRecords[0])];
    return [{ ...mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecords[0]), feePayments }];
  }

  if (payments.length === 1) {
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
  }

  return getKeyingSheetRowsWithPaymentsAcrossFeeRecords({ feeRecords, payments });
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
