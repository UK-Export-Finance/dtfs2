// TODO FN-1853 - rename this to `utilisation-report.repo.ts` when all repo
//  methods have been migrated from MongoDB to SQL
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { AzureFileInfoEntity, DbRequestSource, UtilisationDataEntity, UtilisationReportEntity, ReportPeriod, AzureFileInfo } from '@ukef/dtfs2-common';
import { UtilisationReportRawCsvData } from '../../types/utilisation-reports';
import { utilisationDataCsvRowToSqlEntity } from '../../helpers';

type UpdateWithUploadDetailsParams = {
  azureFileInfo: AzureFileInfo;
  reportCsvData: UtilisationReportRawCsvData[];
  uploadedByUserId: string;
  requestSource: DbRequestSource;
};

export const UtilisationReportRepo = SqlDbDataSource.getRepository(UtilisationReportEntity).extend({
  async findOneByBankIdAndReportPeriod(bankId: string, reportPeriod: ReportPeriod): Promise<UtilisationReportEntity | null> {
    return await this.findOneBy({ bankId, reportPeriod });
  },

  async updateWithUploadDetails(
    report: UtilisationReportEntity,
    { azureFileInfo, reportCsvData, uploadedByUserId, requestSource }: UpdateWithUploadDetailsParams,
  ): Promise<UtilisationReportEntity> {
    const azureFileInfoEntity = AzureFileInfoEntity.create({
      ...azureFileInfo,
      requestSource,
    });

    const dataEntities: UtilisationDataEntity[] = reportCsvData.map((dataEntry) =>
      utilisationDataCsvRowToSqlEntity({
        dataEntry,
        requestSource,
      }),
    );

    const updatedReport = report.updatedWithUploadDetails({
      azureFileInfo: azureFileInfoEntity,
      data: dataEntities,
      uploadedByUserId,
      requestSource,
    });

    return await this.save(updatedReport);
  },
});
