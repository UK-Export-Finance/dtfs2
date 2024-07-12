import { FacilityUtilisationDataEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';

export const FacilityUtilisationDataRepo = SqlDbDataSource.getRepository(FacilityUtilisationDataEntity).extend({
  /**
   * Checks if there exists a row in the facility utilisation data
   * table with an id matching the supplied facility id
   * @param facilityId - The facility id to check for
   * @returns Whether or not an entity with the supplied id exists
   */
  async facilityUtilisationDataWithIdExists(facilityId: string): Promise<boolean> {
    return await this.existsBy({ id: facilityId });
  },
});
