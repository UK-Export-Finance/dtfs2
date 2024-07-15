import { FacilityUtilisationDataEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';

export const FacilityUtilisationDataRepo = SqlDbDataSource.getRepository(FacilityUtilisationDataEntity);
