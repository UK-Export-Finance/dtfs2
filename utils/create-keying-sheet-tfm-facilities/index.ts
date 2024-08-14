import { WithoutId } from 'mongodb';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { Facility, TfmFacility } from '@ukef/dtfs2-common';
import { FacilityClient, mongoDbClient, TfmFacilityClient } from './database-client';
import { generateRandomTfmFacilityForFacility, getSqlFacilityIds, getValidGefDealIdGenerator } from './helpers';
import { aFacilityWithoutDealId } from './mock-data';

const run = async () => {
  const dataSource = await SqlDbDataSource.initialize();

  await FacilityClient.init();
  await TfmFacilityClient.init();

  try {
    const facilityIdsToInsert = await getSqlFacilityIds(dataSource);

    const validGefDealIdGenerator = await getValidGefDealIdGenerator();

    const facilities = facilityIdsToInsert.map((ukefFacilityId) => ({
      ...aFacilityWithoutDealId(),
      ukefFacilityId,
      dealId: validGefDealIdGenerator(),
    })) as Facility[];
    await Promise.all(facilities.map((facility) => FacilityClient.insertIfNotExists(facility)));

    const tfmFacilities: WithoutId<TfmFacility>[] = facilities.map(generateRandomTfmFacilityForFacility);
    await Promise.all(tfmFacilities.map((tfmFacility) => TfmFacilityClient.insertIfNotExists(tfmFacility)));
  } catch (error) {
    console.error('Failed to create tfm facilities:', error);
  } finally {
    await dataSource.destroy();
    await mongoDbClient.close();
  }
};

(async () => {
  await run();
})();
