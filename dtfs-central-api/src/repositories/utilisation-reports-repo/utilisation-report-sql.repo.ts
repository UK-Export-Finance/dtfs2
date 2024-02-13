// TODO FN-1853 - rename this to `utilisation-report.repo.ts` when all repo
//  methods have been migrated from MongoDB to SQL
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { ReportPeriod } from '../../types/utilisation-reports';
import { NotFoundError } from '../../errors';

export const UtilisationReportRepo = SqlDbDataSource.getRepository(UtilisationReportEntity).extend({
  async findOneByBankIdAndReportPeriod(bankId: string, reportPeriod: ReportPeriod): Promise<UtilisationReportEntity | null> {
    return await this.findOneBy({ bankId, reportPeriod });
  },

  async getOneById(id: number): Promise<UtilisationReportEntity> {
    const report = await this.findOneBy({ id });

    if (!report) {
      throw new NotFoundError({ message: `Utilisation Report with ID '${id}' not found` });
    }

    return report;
  },
});
