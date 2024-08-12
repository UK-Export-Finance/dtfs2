import { orderBy } from 'lodash';
import Big from 'big.js';
import { EntityManager } from 'typeorm';
import { FeeRecordEntity, FeeRecordPaymentJoinTableEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup, getFeeRecordPaymentEntityGroupsFromFeeRecordEntities } from '../../../../../helpers';

/**
 * Sorts the payments in-place by amount ascending
 * @param payments - The payments to sort
 */
const sortPaymentsByAmountAscending = (payments: PaymentEntity[]): void => {
  payments.sort((payment1, payment2) => payment1.amount - payment2.amount);
};

/**
 * Sets the last join table entity amount to the actual amount used for the fee record
 * @param joinTableEntities - The list of join table entities
 * @param remainingFeeRecordAmount - The remaining fee record amount (expected to be negative)
 */
const setLastJoinTableEntityPaymentAmountUsedToActualAmountUsed = (
  joinTableEntities: FeeRecordPaymentJoinTableEntity[],
  remainingFeeRecordAmount: Big,
): void => {
  const lastJoinTableEntity = joinTableEntities.pop()!;
  const actualAmountUsed = new Big(lastJoinTableEntity.paymentAmountUsedForFeeRecord!).add(remainingFeeRecordAmount).toNumber();
  lastJoinTableEntity.paymentAmountUsedForFeeRecord = actualAmountUsed;
  joinTableEntities.push(lastJoinTableEntity);
};

/**
 * Maps all remaining payments to a fee record payment join table
 * entity update. Does not attempt to split the payment amounts
 * across the fee records
 * @param payments - The payments to map
 * @param feeRecordId - The associated fee record id
 * @returns The fee record payment join table entities
 */
const mapRemainingPaymentsToFeeRecordPaymentJoinTableEntities = (payments: PaymentEntity[], feeRecordId: number): FeeRecordPaymentJoinTableEntity[] =>
  payments.map((payment) =>
    FeeRecordPaymentJoinTableEntity.create({
      feeRecordId,
      paymentId: payment.id,
      paymentAmountUsedForFeeRecord: payment.amount,
    }),
  );

/**
 * Gets fee record payment join table entities for a fee record
 * using the list of supplied payments (sorted ascending). The
 * return value is populated until the fee record amount has
 * been fully satisfied by the payments used. It is assumed that
 * the total of the payment amounts supplied in the `payments`
 * array is greater than the supplied fee record amount (ie. that
 * the loop calling this function has different behaviour for the
 * last fee record)
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
const getFeeRecordPaymentJoinTableEntitiesForFeeRecordAndPayments = (
  feeRecord: FeeRecordEntity,
  paymentsSortedAscending: PaymentEntity[],
): FeeRecordPaymentJoinTableEntity[] => {
  const feeRecordId = feeRecord.id;
  let remainingFeeRecordAmount = new Big(feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency());

  const joinTableEntities: FeeRecordPaymentJoinTableEntity[] = [];
  while (remainingFeeRecordAmount.gt(0)) {
    const largestPayment = paymentsSortedAscending.pop()!;

    remainingFeeRecordAmount = remainingFeeRecordAmount.sub(largestPayment.amount);
    joinTableEntities.push(
      FeeRecordPaymentJoinTableEntity.create({
        feeRecordId,
        paymentId: largestPayment.id,
        paymentAmountUsedForFeeRecord: largestPayment.amount,
      }),
    );

    if (remainingFeeRecordAmount.lt(0)) {
      setLastJoinTableEntityPaymentAmountUsedToActualAmountUsed(joinTableEntities, remainingFeeRecordAmount);
      largestPayment.amount = remainingFeeRecordAmount.mul(-1).toNumber();
      paymentsSortedAscending.push(largestPayment);
      sortPaymentsByAmountAscending(paymentsSortedAscending);
    }
  }
  return joinTableEntities;
};

/**
 * Gets the updated fee record payment join table
 * entities by greedily splitting payment amounts
 * across the fee record fees sorted in descending
 * order
 * @param param - The fee record payment entity group
 * @param param.feeRecords - The fee record entities
 * @param param.payments - The payment entities
 * @returns The updated entity
 */
const getUpdatedFeeRecordPaymentJoinTableEntitiesFromFeeRecordPaymentGroup = ({
  feeRecords,
  payments,
}: FeeRecordPaymentEntityGroup): FeeRecordPaymentJoinTableEntity[] => {
  const feeRecordsSortedDescending = orderBy(feeRecords, [(feeRecord) => feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency()], ['desc']);
  sortPaymentsByAmountAscending(payments);

  return feeRecordsSortedDescending.reduce((allJoinTableEntities, feeRecord, feeRecordIndex) => {
    const feeRecordId = feeRecord.id;

    if (feeRecordIndex === feeRecords.length - 1) {
      const joinTableEntities = mapRemainingPaymentsToFeeRecordPaymentJoinTableEntities(payments, feeRecordId);
      return [...allJoinTableEntities, ...joinTableEntities];
    }

    const joinTableEntities = getFeeRecordPaymentJoinTableEntitiesForFeeRecordAndPayments(feeRecord, payments);
    return [...allJoinTableEntities, ...joinTableEntities];
  }, [] as FeeRecordPaymentJoinTableEntity[]);
};

/**
 * Updates the fee record payment join table payment amounts
 * used for the corresponding fee record
 * @param matchFeeRecords - Fee records at the MATCH status
 * @param entityManager - The entity manager
 */
export const updateFeeRecordPaymentJoinTablePaymentAmountsUsedForFeeRecord = async (
  matchFeeRecords: FeeRecordEntity[],
  entityManager: EntityManager,
): Promise<void> => {
  const matchFeeRecordPaymentGroups = getFeeRecordPaymentEntityGroupsFromFeeRecordEntities(matchFeeRecords);
  const updatedFeeRecordPaymentJoinTableEntities = matchFeeRecordPaymentGroups.reduce(
    (acc, entityGroup) => [...acc, ...getUpdatedFeeRecordPaymentJoinTableEntitiesFromFeeRecordPaymentGroup(entityGroup)],
    [] as FeeRecordPaymentJoinTableEntity[],
  );

  await Promise.all(
    updatedFeeRecordPaymentJoinTableEntities.map(async ({ feeRecordId, paymentId, paymentAmountUsedForFeeRecord }) => {
      try {
        await entityManager.update(FeeRecordPaymentJoinTableEntity, { feeRecordId, paymentId }, { paymentAmountUsedForFeeRecord });
      } catch (error) {
        console.error(`Failed to update fee record payment join table entity with feeRecordId '${feeRecordId}' and paymentId '${paymentId}':`, error);
        throw error;
      }
    }),
  );
};
