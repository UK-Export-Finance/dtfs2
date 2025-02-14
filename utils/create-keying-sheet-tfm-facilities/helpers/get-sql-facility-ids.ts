import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { DataSource } from 'typeorm';

export const getSqlFacilityIds = async (dataSource: DataSource): Promise<string[]> => {
  const feeRecordRows = await dataSource.manager.find(FeeRecordEntity, { select: ['facilityId'] });
  return [...new Set(feeRecordRows.map(({ facilityId }) => facilityId))];
};
