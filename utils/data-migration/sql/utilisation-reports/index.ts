import {
  UtilisationData as MongoUtilisationData,
  UtilisationReport as MongoUtilisationReport,
  UtilisationReportEntity,
  FeeRecordEntity,
} from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import reportsEJson from './mongodb-ejson/utilisationReports.json';
import reportsDataEJson from './mongodb-ejson/utilisationData.json';
import { deserialiseEJson, toSqlUtilisationReport } from './helpers';

const getSqlReports = (): {
  sqlReports: UtilisationReportEntity[];
  sqlFeeRecords: FeeRecordEntity[];
} => {
  const mongoReports = deserialiseEJson<MongoUtilisationReport[]>(reportsEJson as object);
  console.info('deserialised mongo reports', mongoReports);

  const mongoReportsData = deserialiseEJson<MongoUtilisationData[]>(reportsDataEJson as object);
  console.info('deserialised mongo reports data', mongoReportsData);

  const sqlUtilisationReportAndFeeRecords = mongoReports.map((mongoReport) =>
    toSqlUtilisationReport({
      mongoReport,
      mongoReportData: mongoReportsData.filter((data) => data.reportId === mongoReport._id.toString()),
    }),
  );

  const sqlReports = sqlUtilisationReportAndFeeRecords.reduce<UtilisationReportEntity[]>((acc, { sqlReport }) => [...acc, sqlReport], []);
  console.info('sql reports', sqlReports);

  const allSqlFeeRecords = sqlUtilisationReportAndFeeRecords.reduce<FeeRecordEntity[]>((acc, { sqlFeeRecords }) => [...acc, ...sqlFeeRecords], []);
  console.info('sql fee records', allSqlFeeRecords);

  return { sqlReports, sqlFeeRecords: allSqlFeeRecords };
};

SqlDbDataSource.initialize()
  .then(async () => {
    console.info('🗄️ Successfully initialised connection to SQL database');

    const { sqlReports, sqlFeeRecords } = getSqlReports();

    await SqlDbDataSource.getRepository(UtilisationReportEntity).save(sqlReports);
    await SqlDbDataSource.getRepository(FeeRecordEntity).save(sqlFeeRecords, { chunk: 100 });
    console.info('✅ Successfully saved SQL reports to database');

    await SqlDbDataSource.destroy();
  })
  .catch(async (error) => {
    console.error('❌ Failed to migrate mongo data to SQL database:', error);
    await SqlDbDataSource.destroy();
  });
