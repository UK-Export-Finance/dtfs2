import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionTransientFormDataEntity } from '@ukef/dtfs2-common';
import { EntityManager, LessThan } from 'typeorm';

/**
 * Repository for managing fee record correction  transient form data.
 */
export const FeeRecordCorrectionTransientFormDataRepo = SqlDbDataSource.getRepository(FeeRecordCorrectionTransientFormDataEntity).extend({
  /**
   * Finds the transient form data for the given user id and correction id
   * @param userId - The user id
   * @param correctionId - The correction id
   * @returns The fee record correction transient form data
   */
  async findByUserIdAndCorrectionId(userId: string, correctionId: number): Promise<FeeRecordCorrectionTransientFormDataEntity | null> {
    return await this.findOne({
      where: {
        userId,
        correctionId,
      },
    });
  },

  /**
   * Deletes the transient form data for the given user id and correction id.
   * @param userId - The user id
   * @param correctionId - The correction id
   */
  async deleteByUserIdAndCorrectionId(userId: string, correctionId: number): Promise<void> {
    await this.delete({
      userId,
      correctionId,
    });
  },

  /**
   * Deletes transient fee record correction data that was last updated more than one day ago.
   */
  async deleteByLastUpdatedOlderThanOneDayAgo(): Promise<void> {
    const today = new Date();
    const oneDayAgo = today.setDate(today.getDate() - 1);

    await this.delete({
      lastUpdatedAt: LessThan(new Date(oneDayAgo)),
    });
  },

  withTransaction(transactionEntityManager: EntityManager) {
    const transactionRepository = transactionEntityManager.getRepository(FeeRecordCorrectionTransientFormDataEntity);

    return {
      findByUserIdAndCorrectionId: this.findByUserIdAndCorrectionId.bind(transactionRepository),
      deleteByUserIdAndCorrectionId: this.deleteByUserIdAndCorrectionId.bind(transactionRepository),
    };
  },
});
