import { FacilityUtilisationDataEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';

export const FacilityUtilisationDataRepo = SqlDbDataSource.getRepository(FacilityUtilisationDataEntity).extend({
  /**
   * Checks whether or not a row exists for the supplied id
   * @param id - The id to check for
   * @returns Whether or not a row exists
   */
  async existsById(id: string): Promise<boolean> {
    return this.existsBy({ id });
  },
});
