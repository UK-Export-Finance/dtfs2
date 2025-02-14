import Big from 'big.js';
import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { orderBy } from 'lodash';
import { getFeeRecordPaymentEntityGroups } from '../../../../../helpers';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';

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
 * Splits out a set of fee payments from the supplied list of payment
 * amounts for the supplied fee record using a greedy algorithm.
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

  // Initialise the remaining fee record amount to the fee record's reported payments.
  let remainingFeeRecordAmount = new Big(feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency());

  // If the fee record is the last of the group, it's fee payments
  // should just be the remaining payment amounts since we need to
  // use all the received payments in their entirety.
  if (isLastFeeRecordInGroup) {
    return paymentsSortedByAmountAscending.map((payment) => ({
      feeRecordId,
      paymentId: payment.id,
      feePaymentAmount: payment.amount.toNumber(),
    }));
  }

  // If the fee record is the last of the group we need to take
  // fee payments from the payments in the group until we
  // match the fee record's reported payments.
  const feePayments: KeyingSheetFeePaymentShare[] = [];

  while (paymentsSortedByAmountAscending.length !== 0) {
    const largestPayment = paymentsSortedByAmountAscending.pop()!;

    // If the largest payment amount is greater than the remaining fee record
    // amount we need to split the payment into two parts:
    // - one part to cover the remaining fee record amount which we add to
    //    the fee payment array.
    // - one part to be re-inserted into the payments array
    //    so that the remaining payment gets allocated to another fee record.
    if (largestPayment.amount.gt(remainingFeeRecordAmount)) {
      feePayments.push({
        feeRecordId,
        paymentId: largestPayment.id,
        feePaymentAmount: remainingFeeRecordAmount.toNumber(),
      });

      largestPayment.amount = largestPayment.amount.sub(remainingFeeRecordAmount);
      paymentsSortedByAmountAscending.push(largestPayment);
      sortPaymentsByAmountAscending(paymentsSortedByAmountAscending);

      // Since we have matched the fee record's reported payments
      // with fee payments we can return the fee payments.
      return feePayments;
    }

    // If the largest payment amount is less than or equal to the remaining
    // fee record amount we can use the entire payment amount towards the fee record.
    feePayments.push({
      feeRecordId,
      paymentId: largestPayment.id,
      feePaymentAmount: largestPayment.amount.toNumber(),
    });

    // We subtract the payment amount from the remaining fee record amount
    // and continue to the next payment in the group.
    remainingFeeRecordAmount = remainingFeeRecordAmount.sub(largestPayment.amount);
  }

  return feePayments;
};

/**
 * Splits the payments in the group into 'fee payments' for each fee record,
 * where the total of the 'fee payments' for a fee record matches the
 * fee record payments reported.
 * @param param - The fee record payment entity group
 * @param param.feeRecords - The fee record entities
 * @param param.payments - The payment entities
 * @returns The fee payments
 */
const getFeePaymentsForFeeRecordPaymentEntityGroup = ({ feeRecords, payments }: FeeRecordPaymentEntityGroup): KeyingSheetFeePaymentShare[] => {
  const paymentIdsWithAmounts: PaymentIdAndAmount[] = payments.map(({ id, amount }) => ({ id, amount: new Big(amount) }));
  sortPaymentsByAmountAscending(paymentIdsWithAmounts);

  const feeRecordsSortedDescendingByAmount = orderBy(feeRecords, [(feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency()], ['desc']);

  // We loop through the fee records in descending order of amount
  // and split out 'fee payments' from the list of payment amounts
  // for each fee record in turn, matching the fee record's payments reported.
  return feeRecordsSortedDescendingByAmount.reduce((feePayments, feeRecord, feeRecordIndex) => {
    const isLastFeeRecordInGroup = feeRecordIndex === feeRecords.length - 1;
    return [...feePayments, ...splitPaymentsIntoKeyingSheetFeePaymentShares(feeRecord, paymentIdsWithAmounts, isLastFeeRecordInGroup)];
  }, [] as KeyingSheetFeePaymentShare[]);
};

/**
 * Gets a list of keying sheet fee payment shares for the supplied fee records.
 *
 * This function groups the fee records by the payments they share and
 * then splits the payment amounts across the fee records in the group.
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
