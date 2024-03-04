// TODO FN-1853 - rename this to `utilisation-report.repo.ts` when all repo
//  methods have been migrated from MongoDB to SQL
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { UtilisationReportEntity, ReportPeriod, UTILISATION_REPORT_RECONCILIATION_STATUS } from '@ukef/dtfs2-common';

export type GetUtilisationReportDetailsOptions = {
  reportPeriod?: ReportPeriod;
  excludeNotUploaded?: boolean;
};

export const UtilisationReportRepo = SqlDbDataSource.getRepository(UtilisationReportEntity).extend({
  async findOneByBankIdAndReportPeriod(bankId: string, reportPeriod: ReportPeriod): Promise<UtilisationReportEntity | null> {
    return await this.findOneBy({ bankId, reportPeriod });
  },

  async findAllByBankId(bankId: string, options?: GetUtilisationReportDetailsOptions): Promise<UtilisationReportEntity[]> {
    let query = this.createQueryBuilder('report').where('report.bankId = :bankId', { bankId });
    if (options?.excludeNotUploaded) {
      query = query
        .leftJoinAndSelect('report.azureFileInfo', 'azureFileInfo')
        .andWhere('azureFileInfo.utilisationReportId IS NOT NULL')
        .andWhere('report.status <> :status', { status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED });
    }

    if (options?.reportPeriod) {
      query = query
        .andWhere('report.reportPeriodStartMonth = :startMonth', { startMonth: options.reportPeriod.start.month })
        .andWhere('report.reportPeriodEndMonth = :endMonth', { startMonth: options.reportPeriod.end.month })
        .andWhere('report.reportPeriodStartYear = :startYear', { startMonth: options.reportPeriod.start.year })
        .andWhere('report.reportPeriodEndYear = :endYear', { startMonth: options.reportPeriod.end.year });
    }

    return await query.getMany();
  },
});
