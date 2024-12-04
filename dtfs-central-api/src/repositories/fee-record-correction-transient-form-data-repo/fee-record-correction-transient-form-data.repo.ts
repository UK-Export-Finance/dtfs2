import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionTransientFormDataEntity } from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';

/**
 * Repository for managing fee record correction transient form data.
 */
export const FeeRecordCorrectionTransientFormDataRepo = SqlDbDataSource.getRepository(FeeRecordCorrectionTransientFormDataEntity).extend({
  /**
   * Finds the transient form data for the given user id and fee record id
   * @param userId - The user id
   * @param feeRecordId - The fee record id
   * @returns The fee record correction transient form data
   */
  async findByUserIdAndFeeRecordId(userId: string, feeRecordId: number): Promise<FeeRecordCorrectionTransientFormDataEntity | null> {
    return await this.findOne({
      where: {
        userId,
        feeRecordId,
      },
    });
  },

  withTransaction(transactionEntityManager: EntityManager) {
    const transactionRepository = transactionEntityManager.getRepository(FeeRecordCorrectionTransientFormDataEntity);

    return {
      findByUserIdAndFeeRecordId: this.findByUserIdAndFeeRecordId.bind(transactionRepository),
    };
  },
});
