import Big from 'big.js';
import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { orderBy } from 'lodash';
import { FeeRecordPaymentEntityGroup, getFeeRecordPaymentEntityGroups } from '../../../../../helpers';

export type KeyingSheetFeePaymentShare = {
  feeRecordId: number;
  paymentId: number;
  feePaymentAmount: number;
};

type PaymentIdAndAmount = {
  id: number;
  amount: Big;
};

/**
 * Sorts the payments in-place by amount ascending
 * @param payments - The payments to sort
 */
const sortPaymentsByAmountAscending = (payments: PaymentIdAndAmount[]): void => {
  payments.sort((payment1, payment2) => payment1.amount.sub(payment2.amount).toNumber());
};

/**
 * Splits the supplied payments into a set of fee payments for
 * the supplied fee record using a greedy algorithm.
 *
 * IMPORTANT - This function has a side effect where it modifies
 * the supplied payments array:
 * - any payments which are fully used to cover a fee record
 * amount are removed from the array
 * - a payment whose amount is partially used is re-inserted into
 * the `payments` array with the remaining amount and the array is
 * re-sorted after this insertion takes place
 * @param feeRecord - The fee record entity
 * @param paymentsSortedAscending - The payments (sorted ascending)
 * @returns The fee record payment join table entities
 */
const splitPaymentsIntoKeyingSheetFeePaymentShares = (
  feeRecord: FeeRecordEntity,
  paymentsSortedByAmountAscending: PaymentIdAndAmount[],
  isLastFeeRecordInGroup: boolean,
): KeyingSheetFeePaymentShare[] => {
  const feeRecordId = feeRecord.id;
  let remainingFeeRecordAmount = new Big(feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency());

  if (isLastFeeRecordInGroup) {
    return paymentsSortedByAmountAscending.map((payment) => ({
      feeRecordId,
      paymentId: payment.id,
      feePaymentAmount: payment.amount.toNumber(),
    }));
  }

  const feePayments: KeyingSheetFeePaymentShare[] = [];
  while (paymentsSortedByAmountAscending.length !== 0) {
    const largestPayment = paymentsSortedByAmountAscending.pop()!;

    if (largestPayment.amount.gt(remainingFeeRecordAmount)) {
      feePayments.push({
        feeRecordId,
        paymentId: largestPayment.id,
        feePaymentAmount: remainingFeeRecordAmount.toNumber(),
      });

      largestPayment.amount = largestPayment.amount.sub(remainingFeeRecordAmount);
      paymentsSortedByAmountAscending.push(largestPayment);
      sortPaymentsByAmountAscending(paymentsSortedByAmountAscending);
      return feePayments;
    }

    feePayments.push({
      feeRecordId,
      paymentId: largestPayment.id,
      feePaymentAmount: largestPayment.amount.toNumber(),
    });
    remainingFeeRecordAmount = remainingFeeRecordAmount.sub(largestPayment.amount);
  }
  return feePayments;
};

/**
 * Gets the fee payments for the fee record payment entity group
 * @param param - The fee record payment entity group
 * @param param.feeRecords - The fee record entities
 * @param param.payments - The payment entities
 * @returns The fee payments
 */
const getFeePaymentsForFeeRecordPaymentEntityGroup = ({ feeRecords, payments }: FeeRecordPaymentEntityGroup): KeyingSheetFeePaymentShare[] => {
  const paymentIdsWithAmounts: PaymentIdAndAmount[] = payments.map(({ id, amount }) => ({ id, amount: new Big(amount) }));
  sortPaymentsByAmountAscending(paymentIdsWithAmounts);

  const feeRecordsSortedDescendingByAmount = orderBy(feeRecords, [(feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency()], ['desc']);

  return feeRecordsSortedDescendingByAmount.reduce((feePayments, feeRecord, feeRecordIndex) => {
    const isLastFeeRecordInGroup = feeRecordIndex === feeRecords.length - 1;
    return [...feePayments, ...splitPaymentsIntoKeyingSheetFeePaymentShares(feeRecord, paymentIdsWithAmounts, isLastFeeRecordInGroup)];
  }, [] as KeyingSheetFeePaymentShare[]);
};

/**
 * Gets a list of keying sheet fee payment shares for the supplied fee records
 * @param matchFeeRecordsWithPayments - The fee records at the `MATCH` status with attached payments
 * @returns The fee payments
 */
export const getKeyingSheetFeePaymentSharesForFeeRecords = (matchFeeRecordsWithPayments: FeeRecordEntity[]): KeyingSheetFeePaymentShare[] => {
  const matchFeeRecordPaymentGroups = getFeeRecordPaymentEntityGroups(matchFeeRecordsWithPayments);
  return matchFeeRecordPaymentGroups.reduce(
    (acc, entityGroup) => [...acc, ...getFeePaymentsForFeeRecordPaymentEntityGroup(entityGroup)],
    [] as KeyingSheetFeePaymentShare[],
  );
};
