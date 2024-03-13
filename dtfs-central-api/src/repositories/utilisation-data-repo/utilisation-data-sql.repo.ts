// TODO FN-1853 - rename this to `utilisation-data.repo.ts` when all repo
//  methods have been migrated from MongoDB to SQL
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { UtilisationDataEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';

export const UtilisationDataRepo = SqlDbDataSource.getRepository(UtilisationDataEntity).extend({
  /**
   * Finds all utilisation data entities linked to a report
   * @param report - A utilisation report
   * @returns The found utilisation data entities
   */
  async findByReport(report: UtilisationReportEntity): Promise<UtilisationDataEntity[]> {
    return await this.findBy({ report });
  },
});
