import { FacilityUtilisationDataEntity } from '@ukef/dtfs2-common';
import { DataSource } from 'typeorm';

export const getSqlFacilityIds = async (dataSource: DataSource): Promise<string[]> => {
  const facilityUtilisationDataRows = await dataSource.manager.find(FacilityUtilisationDataEntity, { select: ['id'] });
  return facilityUtilisationDataRows.map(({ id }) => id);
};
