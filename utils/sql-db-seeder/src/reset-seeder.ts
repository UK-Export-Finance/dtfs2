import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { DataSource } from 'typeorm';
import { mongoDbClient } from './mongo-db-client';
import { getAllBanksFromMongoDb } from './helpers';

const SEED_TABLE_NAME = 'seeds';

const getAllReportIdsInsertedBySeeder = async (): Promise<number[]> => {
  const banksVisibleInTfm = (await getAllBanksFromMongoDb()).filter((bank) => bank.isVisibleInTfmUtilisationReports);
  return banksVisibleInTfm.map(({ id }) => {
    const bankIdAsNumber = Number(id);
    if (Number.isNaN(bankIdAsNumber)) {
      throw new Error('Failed to cast bank id to a number');
    }
    return bankIdAsNumber;
  });
};

type SelectCountQueryResponse = [{ '': number }];

const isSeedsTablePopulated = async (dataSource: DataSource): Promise<boolean> => {
  const numberOfSeedTableRows = await dataSource.query<SelectCountQueryResponse>(
    `SELECT COUNT(*) FROM ${SEED_TABLE_NAME}`,
  );
  return numberOfSeedTableRows[0][''] !== 0;
};

const resetSeeder = async (): Promise<void> => {
  const dataSource = await SqlDbDataSource.initialize();
  try {
    if (!(await isSeedsTablePopulated(dataSource))) {
      console.info(`"${SEED_TABLE_NAME}" table has no rows - exiting`);
      return;
    }

    const reportIds = await getAllReportIdsInsertedBySeeder();
    await dataSource.transaction(async (entityManager) => {
      await entityManager.delete('seeds', {});
      await entityManager.delete(UtilisationReportEntity, reportIds);
    });
    console.info('Successfully reset seeder');
  } catch (error) {
    console.error('Failed to reset seeder:', error);
  } finally {
    await dataSource.destroy();
    await mongoDbClient.close();
  }
};

(async () => {
  await resetSeeder();
})();
