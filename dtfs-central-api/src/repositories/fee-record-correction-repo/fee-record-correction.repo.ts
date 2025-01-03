import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionEntity } from '@ukef/dtfs2-common';

/**
 * Repository for managing fee record corrections.
 */
export const FeeRecordCorrectionRepo = SqlDbDataSource.getRepository(FeeRecordCorrectionEntity).extend({
  /**
   * Finds one fee record correction with the supplied id with the fee record
   * and report attached
   * @param id - The fee record correction id
   * @returns The found fee record correction, else null
   */
  async findOneByIdWithFeeRecordAndReport(id: number): Promise<FeeRecordCorrectionEntity | null> {
    return await this.findOne({
      where: {
        id,
      },
      relations: { feeRecord: { report: true } },
    });
  },
});
