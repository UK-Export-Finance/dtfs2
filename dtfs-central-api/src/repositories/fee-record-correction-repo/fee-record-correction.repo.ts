import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionEntity } from '@ukef/dtfs2-common';

/**
 * Repository for managing fee record corrections.
 */
export const FeeRecordCorrectionRepo = SqlDbDataSource.getRepository(FeeRecordCorrectionEntity).extend({
  /**
   * Checks if a fee record correction exists with the given id and bank id.
   * @param correctionId - The id of the correction to check for.
   * @param bankId - The id of the bank to check for.
   * @returns true if a correction exists with the given id and bank id, false otherwise.
   */
  async findByIdAndBankId(correctionId: number, bankId: string): Promise<FeeRecordCorrectionEntity | null> {
    return await this.findOneBy({ id: correctionId, feeRecord: { report: { bankId } } });
  },
});
