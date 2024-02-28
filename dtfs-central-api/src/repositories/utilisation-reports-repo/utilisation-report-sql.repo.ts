// TODO FN-1853 - rename this to `utilisation-report.repo.ts` when all repo
//  methods have been migrated from MongoDB to SQL
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { UtilisationReportEntity, ReportPeriod, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';

export const UtilisationReportRepo = SqlDbDataSource.getRepository(UtilisationReportEntity).extend({
  async findOneByBankIdAndReportPeriod(bankId: string, reportPeriod: ReportPeriod): Promise<UtilisationReportEntity | null> {
    return await this.findOneBy({ bankId, reportPeriod });
  },
  async findOpenReportsBeforeReportPeriodStartForBankId(bankId: string, reportPeriodStart: ReportPeriod['start']): Promise<UtilisationReportEntity[] | null> {
    const statusToExclude: UtilisationReportReconciliationStatus = 'RECONCILIATION_COMPLETED';
    return await this.createQueryBuilder('utilisationReport')
      .where('utilisationReport.bankId = :bankId', { bankId })
      .andWhere('utilisationReport.status != :statusToExclude', { statusToExclude })
      .andWhere(
        this.createQueryBuilder('utilisationReport')
          .where('utilisationReport.reportPeriod.start.year < :reportPeriodStart.year', { reportPeriodStart })
          .orWhere(
            'utilisationReport.reportPeriod.start.year = :reportPeriod.start.year AND utilisationReport.reportPeriod.start.month < :reportPeriodStart.month',
            { reportPeriodStart },
          ),
      )
      .getMany();
    // TODO FN-1862 should we install the typeorm dependency to use that instead of query builder?
    // return await this.find({
    //   where: {
    //     bankId: Equal
    //   }
    // })
  },
});
