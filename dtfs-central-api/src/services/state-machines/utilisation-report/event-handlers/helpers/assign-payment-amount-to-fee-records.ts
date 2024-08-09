import { EntityManager, In } from 'typeorm';
import { FeeRecordEntity, FeeRecordPaymentJoinTableEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup, getFeeRecordPaymentEntityGroupsFromFeeRecordEntities } from '../../../../../helpers';

type SplitPayment = {
  feeRecordId: number;
  paymentId: number;
  paymentAmountUsedForFeeRecord: number;
};

const splitPaymentsAcrossFeeRecords = ({}: FeeRecordPaymentEntityGroup): SplitPayment[] => {
  return {};
};

export const assignPaymentAmountToFeeRecords = async (matchFeeRecords: FeeRecordEntity[], transactionEntityManager: EntityManager): Promise<void> => {
  const joinTableEntries = await transactionEntityManager.find(FeeRecordPaymentJoinTableEntity, {
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
    (acc, entityGroup) => [...acc, ...splitPaymentsAcrossFeeRecords(entityGroup)],
    [] as SplitPayment[],
  );

  await Promise.all(
    paymentAmountUsedInFeeRecords.map(({ feeRecordId, paymentId, paymentAmountUsedForFeeRecord }) => {
      const joinTableEntry = joinTableEntries.find(({ feeRecordId: fid, paymentId: pid }) => feeRecordId === fid && paymentId === pid);
      if (!joinTableEntry) {
        throw new Error(`Failed to find a join table entry for fee record id '${feeRecordId}' and payment id '${paymentId}'`);
      }
      joinTableEntry.paymentAmountUsedForFeeRecord = paymentAmountUsedForFeeRecord;
      return transactionEntityManager.save(FeeRecordPaymentJoinTableEntity, joinTableEntry);
    }),
  );
};
