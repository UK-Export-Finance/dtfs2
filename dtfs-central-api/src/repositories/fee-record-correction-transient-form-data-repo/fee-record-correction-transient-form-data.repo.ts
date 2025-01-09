import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionTransientFormDataEntity } from '@ukef/dtfs2-common';

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
});
