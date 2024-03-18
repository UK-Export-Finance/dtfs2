import { AzureFileInfoEntity, UtilisationDataEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';

export const wipeAllUtilisationReports = async () => {
  await SqlDbDataSource.getRepository(AzureFileInfoEntity).delete({});
  await SqlDbDataSource.getRepository(UtilisationDataEntity).delete({});
  await SqlDbDataSource.getRepository(UtilisationReportEntity).delete({});
};

export const saveUtilisationReportToDatabase = async (report: UtilisationReportEntity): Promise<UtilisationReportEntity> =>
  await SqlDbDataSource.getRepository(UtilisationReportEntity).save(report);
