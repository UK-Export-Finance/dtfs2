import { AzureFileInfoEntity, DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '../../sql-db-entities';
import { UtilisationReportReconciliationStatus } from '../../types';
import { getDbAuditUpdatedByUserId } from '../../sql-db-entities/helpers';
import { ReportPeriodPartialEntity } from '../../sql-db-entities/partial-entities';
import { MOCK_AZURE_FILE_INFO } from './azure-file-info.mock';

export class UtilisationReportEntityMockBuilder {
  private readonly report: UtilisationReportEntity;

  private constructor(report: UtilisationReportEntity) {
    this.report = report;
  }

  public static forStatus(status: UtilisationReportReconciliationStatus): UtilisationReportEntityMockBuilder {
    const bankId = '123';
    const reportPeriod = {
      start: { month: 11, year: 2023 },
      end: { month: 11, year: 2023 },
    };

    if (status === 'REPORT_NOT_RECEIVED') {
      return new UtilisationReportEntityMockBuilder(
        UtilisationReportEntity.createNotReceived({
          bankId,
          reportPeriod,
          requestSource: { platform: 'SYSTEM' },
        }),
      );
    }

    const report = new UtilisationReportEntity();
    const userId = '5ce819935e539c343f141ece';
    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId,
    };

    report.id = 1;
    report.bankId = bankId;
    report.reportPeriod = reportPeriod;
    report.dateUploaded = new Date();
    report.azureFileInfo = AzureFileInfoEntity.create({ ...MOCK_AZURE_FILE_INFO, requestSource });
    report.status = status;
    report.uploadedByUserId = userId;
    report.updatedByUserId = getDbAuditUpdatedByUserId({ platform: 'PORTAL', userId });
    return new UtilisationReportEntityMockBuilder(report);
  }

  public withId(id: number): UtilisationReportEntityMockBuilder {
    this.report.id = id;
    return this;
  }

  public withBankId(bankId: string): UtilisationReportEntityMockBuilder {
    this.report.bankId = bankId;
    return this;
  }

  public withReportPeriod(reportPeriod: ReportPeriodPartialEntity): UtilisationReportEntityMockBuilder {
    this.report.reportPeriod = reportPeriod;
    return this;
  }

  public withDateUploaded(dateUploaded: Date | null): UtilisationReportEntityMockBuilder {
    this.report.dateUploaded = dateUploaded;
    return this;
  }

  public withAzureFileInfo(azureFileInfo: AzureFileInfoEntity): UtilisationReportEntityMockBuilder {
    this.report.azureFileInfo = azureFileInfo;
    return this;
  }

  public withoutAzureFileInfo(): UtilisationReportEntityMockBuilder {
    this.report.azureFileInfo = undefined;
    return this;
  }

  public withUploadedByUserId(uploadedByUserId: string | null): UtilisationReportEntityMockBuilder {
    this.report.uploadedByUserId = uploadedByUserId;
    return this;
  }

  public withFeeRecords(feeRecords: FeeRecordEntity[]): UtilisationReportEntityMockBuilder {
    this.report.feeRecords = feeRecords;
    return this;
  }

  public build(): UtilisationReportEntity {
    return this.report;
  }
}
