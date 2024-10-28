import { ObjectId, WithoutId } from 'mongodb';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { Facility, TfmFacility } from '@ukef/dtfs2-common';
import { FacilityClient, mongoDbClient, TfmFacilityClient, DealClient, TfmDealClient } from './database-client';
import { generateRandomTfmFacilityForFacility, getSqlFacilityIds, getPortalUserIdOrFail } from './helpers';
import { aDeal, aFacility, aTfmDeal } from './mock-data';

/**
 * A function to seed facilities into the mongo db for each facility id
 * used in utilisation reports in the SQL db
 */
const run = async () => {
  const dataSource = await SqlDbDataSource.initialize();

  await FacilityClient.init();
  await TfmFacilityClient.init();
  await DealClient.init();
  await TfmDealClient.init();

  const ukefDealId = '0011223344';

  const dealId = new ObjectId();

  const portalUserId = await getPortalUserIdOrFail();

  try {
    const facilityIdsToInsert = await getSqlFacilityIds(dataSource);

    const facilities = facilityIdsToInsert.map((ukefFacilityId) => ({
      ...aFacility(new ObjectId(), dealId, portalUserId),
      ukefFacilityId,
    })) as Facility[];
    await Promise.all(facilities.map((facility) => FacilityClient.insertIfNotExists(facility)));

    const tfmFacilities: WithoutId<TfmFacility>[] = facilities.map((facility) => generateRandomTfmFacilityForFacility(facility, portalUserId));
    await Promise.all(tfmFacilities.map((tfmFacility) => TfmFacilityClient.insertIfNotExists(tfmFacility)));

    const deal = aDeal(ukefDealId, dealId, portalUserId);
    await DealClient.insertIfNotExists(deal);

    const tfmDeal = { ...aTfmDeal(dealId, portalUserId, deal) };
    await TfmDealClient.insertIfNotExists(tfmDeal);
  } catch (error) {
    console.error('Failed to create tfm facilities: %o', error);
  } finally {
    await dataSource.destroy();
    await mongoDbClient.close();
  }
};

(async () => {
  await run();
})();
