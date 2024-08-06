import Big from 'big.js';
import { orderBy } from 'lodash';
import { FeeRecordEntity, FeeRecordStatus, KeyingSheetAdjustment, PaymentEntity } from '@ukef/dtfs2-common';
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

const mapPaymentEntityToFeePayment = ({ currency, amount, dateReceived }: PaymentEntity) => ({ currency, amount, dateReceived });

const STATUSES_OF_FEE_RECORDS_TO_DISPLAY_ON_KEYING_SHEET: FeeRecordStatus[] = ['READY_TO_KEY', 'RECONCILED'];

const getZeroAmountKeyingSheetFeePayment = ({ paymentCurrency }: FeeRecordEntity) => ({
  currency: paymentCurrency,
  amount: 0,
  dateReceived: null,
});

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
  let paymentsSortedAscending = orderBy(payments, ['amount'], ['asc']);

  return feeRecordsSortedDescending.reduce((keyingSheet, feeRecord) => {
    const createKeyingSheetRow = (keyingSheetRowPayments: PaymentEntity[]): KeyingSheetRow => ({
      ...mapFeeRecordEntityToKeyingSheetRowWithoutFeePayments(feeRecord),
      feePayments: keyingSheetRowPayments.map(mapPaymentEntityToFeePayment),
    });

    let remainingFeeRecordAmount = new Big(feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency());

    const feePaymentsPayments: PaymentEntity[] = [];
    while (remainingFeeRecordAmount.gt(0)) {
      const largestPayment = paymentsSortedAscending.pop()!;
      feePaymentsPayments.push(largestPayment);
      remainingFeeRecordAmount = remainingFeeRecordAmount.sub(largestPayment.amount);
    }

    if (remainingFeeRecordAmount.eq(0)) {
      return [...keyingSheet, createKeyingSheetRow(feePaymentsPayments)];
    }

    // remainingFeeRecordAmount != 0 implies that the amount paid from the last payment is not the full payment amount
    const lastPaymentAdded = feePaymentsPayments.at(-1)!;
    const lastPaymentAddedAmount = lastPaymentAdded.amount;
    lastPaymentAdded.amount = new Big(lastPaymentAddedAmount)
      .add(remainingFeeRecordAmount) // remainingFeeRecordAmount is negative
      .toNumber();
    const newKeyingSheetRow = createKeyingSheetRow(feePaymentsPayments);

    // Add remaining amount of the last added payment to the sorted list of payments
    lastPaymentAdded.amount = remainingFeeRecordAmount.mul(-1).toNumber();
    paymentsSortedAscending = orderBy([...paymentsSortedAscending, lastPaymentAdded], ['amount'], ['asc']);

    return [...keyingSheet, newKeyingSheetRow];
  }, [] as KeyingSheetRow[]);
};

const mapFeeRecordPaymentEntityGroupToKeyingSheetRows = ({ feeRecords, payments }: FeeRecordPaymentEntityGroup): KeyingSheetRow[] => {
  if (feeRecords.length === 1) {
    const feePayments = payments.length > 0 ? payments.map(mapPaymentEntityToFeePayment) : [getZeroAmountKeyingSheetFeePayment(feeRecords[0])];
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
