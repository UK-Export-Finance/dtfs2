import { orderBy } from 'lodash';
import Big from 'big.js';
import { EntityManager, In } from 'typeorm';
import { FeeRecordEntity, FeeRecordPaymentJoinTableEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup, getFeeRecordPaymentEntityGroupsFromFeeRecordEntities } from '../../../../../helpers';

type SplitPayment = {
  feeRecordId: number;
  paymentId: number;
  paymentAmountUsedForFeeRecord: number;
};

const splitPaymentsAcrossGroupedFeeRecord = (
  feeRecord: FeeRecordEntity,
  paymentsSortedDescending: PaymentEntity[],
): {
  splitPayments: SplitPayment[];
  remainingPaymentsSortedDescending: PaymentEntity[];
} => {
  const splitPayments: SplitPayment[] = [];
  let remainingFeeRecordAmount = new Big(feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency());
  let paymentsIndex = 0;
  while (paymentsIndex < paymentsSortedDescending.length) {
    const largestPayment = paymentsSortedDescending[paymentsIndex];
    splitPayments.push({ paymentId: largestPayment.id, feeRecordId: feeRecord.id, paymentAmountUsedForFeeRecord: largestPayment.amount });
    remainingFeeRecordAmount = remainingFeeRecordAmount.sub(largestPayment.amount);
    paymentsIndex += 1;
  }

  if (remainingFeeRecordAmount.eq(0) || paymentsIndex === paymentsSortedDescending.length) {
    return {
      splitPayments,
      remainingPaymentsSortedDescending: [],
    };
  }

  const lastPaymentAmountUsed = remainingFeeRecordAmount.mul(-1).toNumber();
  const lastPaymentAmountRemaining = new Big(paymentsSortedDescending[paymentsIndex - 1].amount).add(remainingFeeRecordAmount).toNumber();

  splitPayments.at(-1)!.paymentAmountUsedForFeeRecord = lastPaymentAmountUsed;
  paymentsSortedDescending[paymentsIndex - 1].amount = lastPaymentAmountRemaining;

  return {
    splitPayments,
    remainingPaymentsSortedDescending: orderBy(paymentsSortedDescending.slice(paymentsIndex - 1), ['amount'], ['desc']),
  };
};

/**
 * Creates keying sheet rows for fee record payment groups
 * with many fee records and many payments by greedily
 * splitting payment amounts across the fee record fees
 * sorted in descending order
 * @param param - The fee record payment entity group
 * @param param.feeRecords - The fee record entities
 * @param param.payments - The payment entities
 * @returns The keying sheet
 */
const splitPaymentsAcrossGroupedFeeRecords = ({ feeRecords, payments }: FeeRecordPaymentEntityGroup): SplitPayment[] => {
  const feeRecordsSortedDescending = orderBy(feeRecords, [(feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency()], ['desc']);
  let paymentsSortedDescending = orderBy(payments, ['amount'], ['desc']);

  return feeRecordsSortedDescending.reduce((splitPayments, feeRecord) => {
    const { splitPayments: newSplitPayments, remainingPaymentsSortedDescending } = splitPaymentsAcrossGroupedFeeRecord(feeRecord, paymentsSortedDescending);
    paymentsSortedDescending = [...remainingPaymentsSortedDescending];
    return [...splitPayments, ...newSplitPayments];
  }, [] as SplitPayment[]);
};

export const assignPaymentAmountToFeeRecords = async (matchFeeRecords: FeeRecordEntity[], entityManager: EntityManager): Promise<void> => {
  const joinTableEntries = await entityManager.find(FeeRecordPaymentJoinTableEntity, {
    where: {
      feeRecordId: In(matchFeeRecords.map(({ id }) => id)),
    },
    relations: {
      payment: false,
      feeRecord: false,
    },
  });
  if (joinTableEntries.length !== matchFeeRecords.length) {
    throw new Error('Failed to find a join table entry for each of the supplied match fee records');
  }

  const matchFeeRecordPaymentGroups = getFeeRecordPaymentEntityGroupsFromFeeRecordEntities(matchFeeRecords);
  const paymentAmountUsedInFeeRecords = matchFeeRecordPaymentGroups.reduce(
    (acc, entityGroup) => [...acc, ...splitPaymentsAcrossGroupedFeeRecords(entityGroup)],
    [] as SplitPayment[],
  );

  await Promise.all(
    paymentAmountUsedInFeeRecords.map(({ feeRecordId, paymentId, paymentAmountUsedForFeeRecord }) => {
      const joinTableEntry = joinTableEntries.find(({ feeRecordId: fid, paymentId: pid }) => feeRecordId === fid && paymentId === pid);
      if (!joinTableEntry) {
        throw new Error(`Failed to find a join table entry for fee record id '${feeRecordId}' and payment id '${paymentId}'`);
      }
      joinTableEntry.paymentAmountUsedForFeeRecord = paymentAmountUsedForFeeRecord;
      return entityManager.save(FeeRecordPaymentJoinTableEntity, joinTableEntry);
    }),
  );
};
