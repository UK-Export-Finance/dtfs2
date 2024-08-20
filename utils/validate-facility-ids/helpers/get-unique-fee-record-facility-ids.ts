import { DataSource } from 'typeorm';
import { FeeRecordEntity } from '@ukef/dtfs2-common';

/**
 * Gets the unique fee record facility ids
 * @param dataSource - The SQL data source
 * @returns The unique fee record facility ids
 */
export const getUniqueFeeRecordFacilityIds = async (dataSource: DataSource): Promise<string[]> => {
  const allFeeRecords = await dataSource.manager.find(FeeRecordEntity, { select: ['facilityId'] });
  const uniqueFeeRecordFacilityIds = allFeeRecords.reduce((set, { facilityId }) => set.add(facilityId), new Set<string>());
  return Array.from(uniqueFeeRecordFacilityIds);
};
