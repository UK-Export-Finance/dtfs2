import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionEntity } from '@ukef/dtfs2-common';

/**
 * Repository for managing fee record corrections.
 */
export const FeeRecordCorrectionRepo = SqlDbDataSource.getRepository(FeeRecordCorrectionEntity).extend({
  /**
   * Finds one fee record correction with the supplied id, fee record id, and
   * report id with the fee record attached
   * @param id - The fee record correction id
   * @param reportId - The report id of the report attached to the fee record
   * @param feeRecordId - The fee record id of the fee record attached to the fee record correction
   * @returns The found fee record correction, else null
   */
  // TODO FN-3668: Omit report and fee record ids? Only accept correction id, but return the report attached to the fee record instead?
  async findOneByIdAndReportIdAndFeeRecordIdWithFeeRecord(id: number, reportId: number, feeRecordId: number): Promise<FeeRecordCorrectionEntity | null> {
    return await this.findOne({
      where: {
        id,
        feeRecord: { id: feeRecordId, report: { id: reportId } },
      },
      // TODO FN-3668: Return the report attached to the fee record too?
      relations: { feeRecord: true },
    });
  },
});
