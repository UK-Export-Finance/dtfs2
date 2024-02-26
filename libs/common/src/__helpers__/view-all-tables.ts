import { DataSource, DataSourceOptions } from 'typeorm';
import { SqlDbDataSource } from '../sql-db-connection';
import { UtilisationReportEntity, UtilisationDataEntity, AzureFileInfoEntity } from '../sql-db-entities';

const tempDataSourceOptions: DataSourceOptions = {
  ...SqlDbDataSource.options,
  logging: false,
};

const tempDataSource = new DataSource(tempDataSourceOptions);

const mapToObjectWithColumnIdAsKey = <T extends UtilisationReportEntity | UtilisationDataEntity | AzureFileInfoEntity, R extends { id: number } = T>(
  input: T[],
  formatter?: (original: T) => R,
): { [key: number]: Omit<R, 'id'> } =>
  input.reduce((output, current) => {
    const formatted = formatter ? formatter(current) : current;
    const { id, ...rest } = formatted;
    return {
      ...output,
      [id]: rest,
    };
  }, {});

const displayAllUtilisationReports = async (dataSource: DataSource): Promise<void> => {
  console.info('-- UTILISATION REPORTS --');
  const utilisationReports = await dataSource.manager.find(UtilisationReportEntity);
  const mappedUtilisationReports = mapToObjectWithColumnIdAsKey(utilisationReports, ({ reportPeriod, ...rest }) => ({
    ...rest,
    reportPeriod: JSON.stringify(reportPeriod),
  }));
  // eslint-disable-next-line no-console
  console.table(mappedUtilisationReports);
};

const displayAllUtilisationData = async (dataSource: DataSource): Promise<void> => {
  console.info('-- UTILISATION DATA --');
  const utilisationData = await dataSource.manager.find(UtilisationDataEntity);
  const mappedUtilisationData = mapToObjectWithColumnIdAsKey(utilisationData);
  // eslint-disable-next-line no-console
  console.table(mappedUtilisationData);
};

const displayAllAzureFileInfo = async (dataSource: DataSource): Promise<void> => {
  console.info('-- AZURE FILE INFO --');
  const azureFileInfo = await dataSource.manager.find(AzureFileInfoEntity);
  const mappedAzureFileInfo = mapToObjectWithColumnIdAsKey(azureFileInfo);
  // eslint-disable-next-line no-console
  console.table(mappedAzureFileInfo);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
tempDataSource.initialize().then(async (dataSource) => {
  console.info('-- DISPLAYING ALL TABLES (index column = column id) --');

  await displayAllUtilisationReports(dataSource);
  await displayAllUtilisationData(dataSource);
  await displayAllAzureFileInfo(dataSource);

  await dataSource.destroy();
});
