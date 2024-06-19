import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { UtilisationReportEntity, ReportPeriod } from '@ukef/dtfs2-common';
import { Not, Equal, FindOptionsWhere, LessThan, In } from 'typeorm';

export type GetUtilisationReportDetailsOptions = {
  reportPeriod?: ReportPeriod;
  excludeNotReceived?: boolean;
};

export const UtilisationReportRepo = SqlDbDataSource.getRepository(UtilisationReportEntity).extend({
  /**
   * Finds one report by bank id and report period
   * @param bankId - The bank id
   * @param reportPeriod - The report period
   * @returns The found report
   */
  async findOneByBankIdAndReportPeriod(bankId: string, reportPeriod: ReportPeriod, includeFeeRecords = false): Promise<UtilisationReportEntity | null> {
    return await this.findOne({
      where: { bankId, reportPeriod },
      relations: {
        feeRecords: includeFeeRecords,
      },
    });
  },

  /**
   * Finds all reports with bankId and matching options
   * @param bankId - The id of the bank to fetch reports for
   * @param options - The options determining which reports are retrieved for the given bank
   * @returns The found reports
   */
  async findAllByBankId(bankId: string, options?: GetUtilisationReportDetailsOptions): Promise<UtilisationReportEntity[]> {
    const findByOptionsWhere: FindOptionsWhere<UtilisationReportEntity> = { bankId };

    if (options?.reportPeriod) {
      findByOptionsWhere.reportPeriod = options.reportPeriod;
    }

    if (options?.excludeNotReceived) {
      findByOptionsWhere.status = Not('REPORT_NOT_RECEIVED');
    }

    return await this.find({
      where: findByOptionsWhere,
      order: {
        reportPeriod: {
          start: {
            year: 'ASC',
            month: 'ASC',
          },
          end: {
            year: 'ASC',
            month: 'ASC',
          },
        },
      },
    });
  },

  /**
   * Finds open reports by bank id which have report periods which ended before
   * the supplied report period end
   * @param bankId - The bank id
   * @param reportPeriodEnd - The report period end
   * @returns The found report
   */
  async findOpenReportsForBankIdWithReportPeriodEndBefore(
    bankId: string,
    reportPeriodEnd: ReportPeriod['end'],
    includeFeeRecords = false,
  ): Promise<UtilisationReportEntity[]> {
    const bankIdAndStatusFindOptions: FindOptionsWhere<UtilisationReportEntity> = {
      bankId,
      status: Not('RECONCILIATION_COMPLETED'),
    };

    const previousYearFindOptions: FindOptionsWhere<UtilisationReportEntity> = {
      reportPeriod: {
        end: {
          year: LessThan(reportPeriodEnd.year),
        },
      },
    };

    const sameYearPreviousMonthsFindOptions: FindOptionsWhere<UtilisationReportEntity> = {
      reportPeriod: {
        end: {
          year: Equal(reportPeriodEnd.year),
          month: LessThan(reportPeriodEnd.month),
        },
      },
    };

    return await this.find({
      where: [
        { ...bankIdAndStatusFindOptions, ...previousYearFindOptions },
        { ...bankIdAndStatusFindOptions, ...sameYearPreviousMonthsFindOptions },
      ],
      relations: {
        feeRecords: includeFeeRecords,
      },
      order: {
        reportPeriod: {
          end: {
            year: 'ASC',
            month: 'ASC',
          },
        },
      },
    });
  },

  /**
   * Finds submitted reports & fee records by bank id which have report periods which ended in
   * the supplied year
   * @param bankId - The bank id
   * @param year - The search year
   * @returns The found reports
   */
  async findSubmittedReportsForBankIdWithReportPeriodEndInYear(bankId: string, year: number): Promise<UtilisationReportEntity[]> {
    const bankIdAndStatusFindOptions: FindOptionsWhere<UtilisationReportEntity> = {
      bankId,
      status: Not('REPORT_NOT_RECEIVED'),
    };

    const sameYearFindOptions: FindOptionsWhere<UtilisationReportEntity> = {
      reportPeriod: {
        end: {
          year: Equal(year),
        },
      },
    };

    return await this.find({
      where: { ...bankIdAndStatusFindOptions, ...sameYearFindOptions },
      relations: {
        feeRecords: true,
      },
      order: {
        reportPeriod: {
          end: {
            month: 'ASC',
          },
        },
      },
    });
  },

  /**
   * Finds a utilisation report with the supplied id and attached
   * all the fee records which match the supplied fee record id
   * list
   * @param reportId - The report id
   * @param feeRecordIds - The fee record ids to include
   * @returns The utilisation report with the attached fee records
   */
  async findOneByIdWithFeeRecordsFilteredById(reportId: number, feeRecordIds: number[]): Promise<UtilisationReportEntity | null> {
    return await UtilisationReportRepo.findOne({
      where: {
        id: Number(reportId),
        feeRecords: {
          id: In(feeRecordIds),
        },
      },
      relations: { feeRecords: true },
    });
  },
});
