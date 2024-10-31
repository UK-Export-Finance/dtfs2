import { faker } from '@faker-js/faker';
import {
  AzureFileInfoEntity,
  MOCK_AZURE_FILE_INFO,
  ReportPeriod,
  REQUEST_PLATFORM_TYPE,
  UtilisationReportEntity,
  UtilisationReportReconciliationStatus,
} from '@ukef/dtfs2-common';
import { DataSource } from 'typeorm';

export class UtilisationReportSeeder {
  private readonly bankId: string;

  private readonly reportPeriod: ReportPeriod;

  private readonly azureFileInfo = AzureFileInfoEntity.create({
    ...MOCK_AZURE_FILE_INFO,
    requestSource: { platform: REQUEST_PLATFORM_TYPE.SYSTEM },
  });

  private uploadedByUserId: string | null = null;

  private constructor(bankId: string, reportPeriod: ReportPeriod) {
    this.bankId = bankId;
    this.reportPeriod = reportPeriod;
  }

  public static forBankIdAndReportPeriod({ bankId, reportPeriod }: { bankId: string; reportPeriod: ReportPeriod }): UtilisationReportSeeder {
    return new UtilisationReportSeeder(bankId, reportPeriod);
  }

  public withUploadedByUserId(userId: string): UtilisationReportSeeder {
    this.uploadedByUserId = userId;
    return this;
  }

  public async saveWithStatus(status: UtilisationReportReconciliationStatus, dataSource: DataSource): Promise<void> {
    const report = new UtilisationReportEntity();

    report.status = status;
    report.bankId = this.bankId;
    report.reportPeriod = this.reportPeriod;
    report.updateLastUpdatedBy({ platform: REQUEST_PLATFORM_TYPE.SYSTEM });

    if (status === 'REPORT_NOT_RECEIVED') {
      await dataSource.manager.save(UtilisationReportEntity, report);
      return;
    }

    if (!this.uploadedByUserId) {
      throw new Error(`Cannot save a '${status}' report without an uploadedByUserId`);
    }

    report.uploadedByUserId = this.uploadedByUserId;
    report.azureFileInfo = this.azureFileInfo;
    report.dateUploaded = faker.date.recent({ days: 30 });

    await dataSource.manager.save(UtilisationReportEntity, report);
  }
}
