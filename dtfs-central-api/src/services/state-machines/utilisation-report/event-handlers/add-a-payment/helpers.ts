import { EntityManager } from 'typeorm';
import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { feeRecordsAndPaymentsMatch } from '../../../../../helpers/fee-record-matching';

const getPaymentsAttachedToFeeRecord = async (feeRecord: FeeRecordEntity, transactionEntityManager: EntityManager): Promise<PaymentEntity[]> => {
  const feeRecordsWithPayments = await transactionEntityManager.find(FeeRecordEntity, {
    where: { id: feeRecord.id },
    relations: { payments: true },
  });
  return feeRecordsWithPayments[0].payments;
};

export const feeRecordsMatchAttachedPayments = async (feeRecords: FeeRecordEntity[], transactionEntityManager: EntityManager): Promise<boolean> => {
  return feeRecordsAndPaymentsMatch(feeRecords, await getPaymentsAttachedToFeeRecord(feeRecords[0], transactionEntityManager));
};
