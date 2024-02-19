import { UtilisationData as MongoUtilisationData, UtilisationReport as MongoUtilisationReport, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import reportsEJson from './mongodb-ejson/utilisationReports.json';
import reportsDataEJson from './mongodb-ejson/utilisationData.json';
import { deserialiseEJson, toSqlUtilisationReport } from './helpers';

const getSqlReports = (): UtilisationReportEntity[] => {
  const mongoReports = deserialiseEJson<MongoUtilisationReport[]>(reportsEJson);
  console.info('deserialised mongo reports', mongoReports);

  const mongoReportsData = deserialiseEJson<MongoUtilisationData[]>(reportsDataEJson);
  console.info('deserialised mongo reports data', mongoReportsData);

  const sqlReports = mongoReports.map((mongoReport) =>
    toSqlUtilisationReport({
      mongoReport,
      mongoReportData: mongoReportsData.filter((data) => data.reportId === mongoReport._id.toString()),
    }),
  );
  console.info('transformed SQL reports', sqlReports);

  return sqlReports;
};

SqlDbDataSource.initialize()
  .then(async () => {
    console.info('🗄️ Successfully initialised connection to SQL database');

    await SqlDbDataSource.getRepository(UtilisationReportEntity).save(getSqlReports());
    console.info('✅ Successfully saved SQL reports to database');

    await SqlDbDataSource.destroy();
  })
  .catch(async (error) => {
    console.error('❌ Failed to migrate mongo data to SQL database:', error);
    await SqlDbDataSource.destroy();
  });
