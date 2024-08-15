import { difference } from 'lodash';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { mongoDbClient } from './database-client';
import { getUniqueFeeRecordFacilityIds, getUniqueTfmFacilitiesUkefFacilityIds } from './helpers';

const run = async (): Promise<void> => {
  const dataSource = await SqlDbDataSource.initialize();
  try {
    const tfmFacilitiesUkefFacilityIds = await getUniqueTfmFacilitiesUkefFacilityIds();
    const feeRecordFacilityIds = await getUniqueFeeRecordFacilityIds(dataSource);

    const feeRecordFacilityIdsNotInTfmFacilities = difference(feeRecordFacilityIds, tfmFacilitiesUkefFacilityIds);

    if (feeRecordFacilityIdsNotInTfmFacilities.length === 0) {
      console.info('All fee record facility ids exist in the tfm facilities collection');
      return;
    }

    feeRecordFacilityIdsNotInTfmFacilities.forEach((facilityId) => {
      console.info(`Facility id '${facilityId}' exists in the FeeRecord table but not in the "tfm-facilities" collection`);
    });
  } catch (error) {
    console.error('Failed to validate facility ids:', error);
  } finally {
    await dataSource.destroy();
    await mongoDbClient.close();
  }
};

(async () => {
  await run();
})();
