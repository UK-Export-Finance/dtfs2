import { EntityManager } from 'typeorm';
import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { feeRecordsAndPaymentsMatch } from '../../../../../helpers/fee-record-matching';

/**
 * Gets the payments attached to the supplied fee record
 * @param feeRecord - The fee record
 * @param entityManager - The entity manager
 * @returns The attached payments
 */
const getPaymentsAttachedToFeeRecord = async (feeRecord: FeeRecordEntity, entityManager: EntityManager): Promise<PaymentEntity[]> => {
  const { payments } = await entityManager.findOneOrFail(FeeRecordEntity, {
    where: { id: feeRecord.id },
    relations: { payments: true },
  });
  return payments;
};

/**
 * Checks whether or not the supplied fee records match their attached payments
 * @param feeRecords - The fee records
 * @param entityManager - The entity manager
 * @returns Whether or not the fee records match the attached payments
 */
export const feeRecordsMatchAttachedPayments = async (feeRecords: FeeRecordEntity[], entityManager: EntityManager): Promise<boolean> => {
  return feeRecordsAndPaymentsMatch(feeRecords, await getPaymentsAttachedToFeeRecord(feeRecords[0], entityManager), entityManager);
};
