import { In } from 'typeorm';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordEntity, FeeRecordStatus, UtilisationReportEntity } from '@ukef/dtfs2-common';

export const FeeRecordRepo = SqlDbDataSource.getRepository(FeeRecordEntity).extend({
  /**
   * Finds all fee record entities linked to a report
   * @param report - A utilisation report
   * @returns The found fee record entities
   */
  async findByReport(report: UtilisationReportEntity): Promise<FeeRecordEntity[]> {
    return await this.findBy({ report });
  },

  /**
   * Finds fee record entities attached to a report with the
   * supplied id which match the supplied statuses with the
   * report attached
   * @param reportId - The report id of the report attached to the fee records
   * @param statuses - The fee record statuses to search by
   * @returns The found fee record entities
   */
  async findByReportIdAndStatusesWithReport(reportId: number, statuses: FeeRecordStatus[]): Promise<FeeRecordEntity[]> {
    return await this.find({
      where: {
        report: { id: reportId },
        status: In(statuses),
      },
      relations: { report: true },
    });
  },

  /**
   * Finds all fee record entities which match the supplied statuses
   * @param statuses - The fee record statuses to search by
   * @returns The found fee record entities
   */
  async findByStatuses(statuses: FeeRecordStatus[]): Promise<FeeRecordEntity[]> {
    return await this.find({
      where: { status: In(statuses) },
    });
  },
});
