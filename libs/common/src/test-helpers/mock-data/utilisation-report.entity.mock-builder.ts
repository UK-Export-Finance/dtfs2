import { REQUEST_PLATFORM_TYPE, UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';
import { AzureFileInfoEntity, DbRequestSource, FeeRecordEntity, UtilisationReportEntity, ReportPeriodPartialEntity } from '../../sql-db-entities';
import { UtilisationReportReconciliationStatus } from '../../types';
import { MOCK_AZURE_FILE_INFO } from './azure-file-info.mock';

export class UtilisationReportEntityMockBuilder<ReportStatus extends UtilisationReportReconciliationStatus> {
  private readonly report: UtilisationReportEntity;

  public constructor(report?: UtilisationReportEntity) {
    this.report = report ?? UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS).report;
  }

  public static forStatus<Status extends UtilisationReportReconciliationStatus>(status: Status): UtilisationReportEntityMockBuilder<Status> {
    const bankId = '123';
    const reportPeriod = {
      start: { month: 11, year: 2023 },
      end: { month: 11, year: 2023 },
    };

    if (status === 'REPORT_NOT_RECEIVED') {
      return new UtilisationReportEntityMockBuilder<typeof status>(
        UtilisationReportEntity.createNotReceived({
          bankId,
          reportPeriod,
          requestSource: { platform: REQUEST_PLATFORM_TYPE.SYSTEM },
        }),
      );
    }

    const report = new UtilisationReportEntity();
    const userId = '5ce819935e539c343f141ece';
    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.PORTAL,
      userId,
    };

    report.id = 1;
    report.bankId = bankId;
    report.reportPeriod = reportPeriod;
    report.dateUploaded = new Date();
    report.azureFileInfo = AzureFileInfoEntity.create({ ...MOCK_AZURE_FILE_INFO, requestSource });
    report.status = status;
    report.uploadedByUserId = userId;
    report.updateLastUpdatedBy({ platform: REQUEST_PLATFORM_TYPE.PORTAL, userId });
    return new UtilisationReportEntityMockBuilder(report);
  }

  public withId(id: number): UtilisationReportEntityMockBuilder<ReportStatus> {
    this.report.id = id;
    return this;
  }

  public withBankId(bankId: string): UtilisationReportEntityMockBuilder<ReportStatus> {
    this.report.bankId = bankId;
    return this;
  }

  public withReportPeriod(reportPeriod: ReportPeriodPartialEntity): UtilisationReportEntityMockBuilder<ReportStatus> {
    this.report.reportPeriod = reportPeriod;
    return this;
  }

  public withDateUploaded(dateUploaded: null | Date): UtilisationReportEntityMockBuilder<ReportStatus> {
    this.report.dateUploaded = dateUploaded;
    return this;
  }

  public withAzureFileInfo(
    azureFileInfo: ReportStatus extends 'REPORT_NOT_RECEIVED' ? undefined : AzureFileInfoEntity,
  ): UtilisationReportEntityMockBuilder<ReportStatus> {
    this.report.azureFileInfo = azureFileInfo;
    return this;
  }

  public withUploadedByUserId(uploadedByUserId: null | string): UtilisationReportEntityMockBuilder<ReportStatus> {
    this.report.uploadedByUserId = uploadedByUserId;
    return this;
  }

  public withFeeRecords(feeRecords: FeeRecordEntity[]): UtilisationReportEntityMockBuilder<ReportStatus> {
    this.report.feeRecords = feeRecords;
    return this;
  }

  public build(): UtilisationReportEntity {
    return this.report;
  }
}
