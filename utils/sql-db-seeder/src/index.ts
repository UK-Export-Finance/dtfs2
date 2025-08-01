import { DataSource } from 'typeorm';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { AzureFileInfoEntity, FeeRecordEntity, PaymentEntity, PaymentMatchingToleranceEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { seedUtilisationReports } from './utilisation-report';
import { seedFeeRecordPaymentGroups } from './fee-record-payment-group';
import { mongoDbClient } from '../../drivers/db-client';
import { seedPaymentMatchingTolerances } from './payment-matching-tolerance/payment-matching-tolerance.seed';

/**
 * Clears all data from the specified MSSQL database.
 *
 * @param {DataSource} dataSource - The data source representing the MSSQL database.
 * @returns {Promise<void>} - A promise that resolves when the database has been cleared.
 */
const clearDatabase = async (dataSource: DataSource): Promise<void> => {
  console.info('⚡ Clearing MSSQL database');

  await dataSource.createQueryBuilder().delete().from(PaymentEntity).execute();
  await dataSource.createQueryBuilder().delete().from(FeeRecordEntity).execute();
  await dataSource.createQueryBuilder().delete().from(UtilisationReportEntity).execute();
  await dataSource.createQueryBuilder().delete().from(AzureFileInfoEntity).execute();
  await dataSource.createQueryBuilder().delete().from(PaymentMatchingToleranceEntity).execute();

  console.info('✅ MSSQL database has been cleared successfully');
};

/**
 * Seeds the specified MSSQL database with initial data.
 *
 * @param {DataSource} dataSource - The data source representing the MSSQL database.
 * @returns {Promise<void>} - A promise that resolves when the database has been seeded.
 */
const seedData = async (dataSource: DataSource): Promise<void> => {
  console.info('⚡ Seeding MSSQL database');

  await seedUtilisationReports(dataSource);
  await seedFeeRecordPaymentGroups(dataSource);
  await seedPaymentMatchingTolerances(dataSource);

  console.info('✅ MSSQL database has been seeded successfully');
};

/**
 * Runs the database seeding process, including clearing the database and seeding it with initial data.
 *
 * @returns {Promise<void>} - A promise that resolves when the seeding process is complete.
 */
const run = async (): Promise<void> => {
  const dataSource: DataSource = await SqlDbDataSource.initialize();

  try {
    await clearDatabase(dataSource);
    await seedData(dataSource);

    console.info('✅ MSSQL data seeding has been successful');
  } catch (error) {
    console.error('❌ MSSQL data seeding has failed %o', error);
  } finally {
    await dataSource.destroy();
    await mongoDbClient.close();

    console.info('✅ MSSQL connection has been closed.');
  }
};

/**
 * Immediately-invoked function expression (IIFE)
 *
 * Below pattern is being used to execute the `run` function
 * as soon as the script has been loaded, without waiting for
 * any external triggers.
 *
 * This pattern is ideal for intialisation scripts.
 */
(async () => {
  await run();
})();
