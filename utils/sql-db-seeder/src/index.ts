import { DataSource } from 'typeorm';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { AzureFileInfoEntity, FacilityUtilisationDataEntity, FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { seedUtilisationReports } from './utilisation-report';
import { seedFeeRecordPaymentGroups } from './fee-record-payment-group';
import { mongoDbClient } from './mongo-db-client';

const clearDatabase = async (dataSource: DataSource): Promise<void> => {
  await dataSource.manager.delete(PaymentEntity, {});
  await dataSource.manager.delete(FeeRecordEntity, {});
  await dataSource.manager.delete(UtilisationReportEntity, {});
  await dataSource.manager.delete(AzureFileInfoEntity, {});
  await dataSource.manager.delete(FacilityUtilisationDataEntity, {});
};

const seedData = async (dataSource: DataSource): Promise<void> => {
  await seedUtilisationReports(dataSource);
  await seedFeeRecordPaymentGroups(dataSource);
};

const run = async (): Promise<void> => {
  const dataSource = await SqlDbDataSource.initialize();
  try {
    console.info('Clearing SQL database...');
    await clearDatabase(dataSource);

    console.info('Seeding data...');
    await seedData(dataSource);

    console.info('Successfully seeded data!');
  } catch (error) {
    console.error('Failed to seed SQL data:', error);
  } finally {
    await dataSource.destroy();
    await mongoDbClient.close();
    console.info('Successfully closed database connections!');
  }
};

(async () => {
  await run();
})();
