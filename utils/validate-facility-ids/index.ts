import { difference } from 'lodash';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { mongoDbClient } from './database-client';
import { getUniqueFeeRecordFacilityIds, getUniqueTfmFacilitiesUkefFacilityIds } from './helpers';

const run = async (): Promise<void> => {
  const dataSource = await SqlDbDataSource.initialize();
  try {
    const tfmFacilitiesUkefFacilityIds = await getUniqueTfmFacilitiesUkefFacilityIds();
    const feeRecordFacilityIds = await getUniqueFeeRecordFacilityIds(dataSource);

    const tfmFacilitiesFacilityIdsNotInFeeRecord = difference(tfmFacilitiesUkefFacilityIds, feeRecordFacilityIds);
    const feeRecordFacilityIdsNotInTfmFacilities = difference(feeRecordFacilityIds, tfmFacilitiesUkefFacilityIds);

    if (tfmFacilitiesFacilityIdsNotInFeeRecord.length === 0 && feeRecordFacilityIdsNotInTfmFacilities.length === 0) {
      console.info('All fee record facility ids exist in the tfm facilities collection');
      return;
    }

    tfmFacilitiesFacilityIdsNotInFeeRecord.forEach((facilityId) => {
      console.info(`Facility id '${facilityId}' exists in the "tfm-facilities" collection but not in the FeeRecord table`);
    });

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
