import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordRepo } from '../fee-record-repo';

export const PaymentRepo = SqlDbDataSource.getRepository(PaymentEntity).extend({
  /**
   * Finds all payment entities linked to the supplied fee records
   * @param feeRecords - A list of fee records
   * @returns The attached payments
   */
  async findByFeeRecord(feeRecord: FeeRecordEntity): Promise<PaymentEntity[]> {
    console.info('Finding number of fee records');
    const numberOfPayments = await this.count({});
    console.info(numberOfPayments);
    if (numberOfPayments === 0) {
      return [];
    }
    const feeRecords = await FeeRecordRepo.find({
      where: { id: feeRecord.id },
      relations: { payments: true },
    });
    return feeRecords[0].payments;
  },
});
