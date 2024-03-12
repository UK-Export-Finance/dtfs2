import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';

export const FeeRecordRepo = SqlDbDataSource.getRepository(FeeRecordEntity).extend({
  /**
   * Finds all utilisation data entities linked to a report
   * @param report - A utilisation report
   * @returns The found utilisation data entities
   */
  async findByReport(report: UtilisationReportEntity): Promise<FeeRecordEntity[]> {
    return await this.findBy({ report });
  },
});
