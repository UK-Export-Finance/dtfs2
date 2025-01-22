import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionRequestTransientFormDataEntity } from '@ukef/dtfs2-common';
import { EntityManager, LessThan } from 'typeorm';

/**
 * Repository for managing fee record correction request transient form data.
 */
export const FeeRecordCorrectionRequestTransientFormDataRepo = SqlDbDataSource.getRepository(FeeRecordCorrectionRequestTransientFormDataEntity).extend({
  /**
   * Finds the transient form data for the given user id and fee record id
   * @param userId - The user id
   * @param feeRecordId - The fee record id
   * @returns The fee record correction request transient form data
   */
  async findByUserIdAndFeeRecordId(userId: string, feeRecordId: number): Promise<FeeRecordCorrectionRequestTransientFormDataEntity | null> {
    return await this.findOne({
      where: {
        userId,
        feeRecordId,
      },
    });
  },

  /**
   * Deletes the transient form data for the given user id and fee record id,
   * if exists.
   * @param userId - The user id
   * @param feeRecordId - The fee record id
   */
  async deleteByUserIdAndFeeRecordId(userId: string, feeRecordId: number): Promise<void> {
    await this.delete({
      userId,
      feeRecordId,
    });
  },

  /**
   * deletes the transient form data which is older than a day old
   */
  async deleteAllOlderThanOneDay(): Promise<void> {
    const today = new Date();
    const oneDayAgo = today.setDate(today.getDate() - 1);

    await this.delete({
      lastUpdatedAt: LessThan(new Date(oneDayAgo)),
    });
  },

  withTransaction(transactionEntityManager: EntityManager) {
    const transactionRepository = transactionEntityManager.getRepository(FeeRecordCorrectionRequestTransientFormDataEntity);

    return {
      findByUserIdAndFeeRecordId: this.findByUserIdAndFeeRecordId.bind(transactionRepository),
      deleteByUserIdAndFeeRecordId: this.deleteByUserIdAndFeeRecordId.bind(transactionRepository),
    };
  },
});
