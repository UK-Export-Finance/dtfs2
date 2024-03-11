// TODO FN-1853 - rename this to `utilisation-report.repo.ts` when all repo
//  methods have been migrated from MongoDB to SQL
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { UtilisationReportEntity, ReportPeriod, UTILISATION_REPORT_RECONCILIATION_STATUS } from '@ukef/dtfs2-common';
import { Not, Equal, FindOptionsWhere, LessThan } from 'typeorm';

export type GetUtilisationReportDetailsOptions = {
  reportPeriod?: ReportPeriod;
  excludeNotReceived?: boolean;
};


export const UtilisationReportRepo = SqlDbDataSource.getRepository(UtilisationReportEntity).extend({
  async findOneByBankIdAndReportPeriod(bankId: string, reportPeriod: ReportPeriod): Promise<UtilisationReportEntity | null> {
    return await this.findOneBy({ bankId, reportPeriod });
  },

  async findAllByBankId(bankId: string, options?: GetUtilisationReportDetailsOptions): Promise<UtilisationReportEntity[]> {
    return await this.findBy({
      bankId,
      ...(options?.reportPeriod && { reportPeriod: options.reportPeriod }),
      ...(options?.excludeNotReceived && { status: Not(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) }),
    });
  },

  async findOpenReportsBeforeReportPeriodStartForBankId(bankId: string, reportPeriodStart: ReportPeriod['start']): Promise<UtilisationReportEntity[]> {
    const bankIdAndStatusFindOptions: FindOptionsWhere<UtilisationReportEntity> = {
      bankId,
      status: Not('RECONCILIATION_COMPLETED'),
    };

    const previousYearFindOptions: FindOptionsWhere<UtilisationReportEntity> = {
      reportPeriod: {
        start: {
          year: LessThan(reportPeriodStart.year),
        },
      },
    };

    const sameYearPreviousMonthsFindOptions: FindOptionsWhere<UtilisationReportEntity> = {
      reportPeriod: {
        start: {
          year: Equal(reportPeriodStart.year),
          month: LessThan(reportPeriodStart.month),
        },
      },
    };

    return await this.find({
      where: [
        { ...bankIdAndStatusFindOptions, ...previousYearFindOptions },
        { ...bankIdAndStatusFindOptions, ...sameYearPreviousMonthsFindOptions },
      ],
    });
  },
});
