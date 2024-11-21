import { DbRequestSource, FacilityUtilisationDataEntity, ReportPeriod } from '@ukef/dtfs2-common';
import { EntityManager, In } from 'typeorm';
import { getPreviousReportPeriod } from '../../helpers';
import { calculateInitialUtilisationAndFixedFee } from './helpers';
import { CHUNK_SIZE_FOR_SQL_BATCH_SAVING } from '../../constants';

export class FacilityUtilisationDataService {
  /**
   * Create and save initial facility utilisation data for any
   * facilities that do not already have any.
   * @param facilityIds - facility ids
   * @param bankId - bank id
   * @param reportPeriod - report period
   * @param requestSource - request source
   * @param entityManager - entity manager
   */
  public static async initialiseFacilityUtilisationData(
    facilityIds: Set<string>,
    bankId: string,
    reportPeriod: ReportPeriod,
    requestSource: DbRequestSource,
    entityManager: EntityManager,
  ) {
    const facilityIdsToInitialise = await this.filterOutFacilityIdsWithExistingUtilisationData(facilityIds, entityManager);

    /**
     * If all facilities have existing utilisation data then we would expect there to
     * not be any facility ids needing initialisation.
     * In this case we return early to avoid making any unnecessary db calls,
     * e.g. we don't need to fetch previous report period from the bank's
     * utilisation reporting schedule stored in mongo.
     */
    if (facilityIdsToInitialise.size === 0) {
      return;
    }

    const previousReportPeriod = await getPreviousReportPeriod(bankId, reportPeriod);
    const entities: FacilityUtilisationDataEntity[] = [];

    for (const id of facilityIdsToInitialise) {
      const { utilisation, fixedFee } = await calculateInitialUtilisationAndFixedFee(id);

      entities.push(
        FacilityUtilisationDataEntity.create({
          id,
          reportPeriod: previousReportPeriod,
          requestSource,
          utilisation,
          fixedFee,
        }),
      );
    }

    await entityManager.save(FacilityUtilisationDataEntity, entities, { chunk: CHUNK_SIZE_FOR_SQL_BATCH_SAVING });
  }

  /**
   * Filter out facility ids with existing facility utilisation data
   * @param facilityIds - facility ids to filter
   * @param entityManager - transaction entity manager
   * @returns the filtered set
   */
  public static async filterOutFacilityIdsWithExistingUtilisationData(facilityIds: Set<string>, entityManager: EntityManager): Promise<Set<string>> {
    const existingFacilityUtilisationDataEntities = await entityManager.findBy(FacilityUtilisationDataEntity, { id: In(Array.from(facilityIds)) });

    const facilityIdsWithExistingUtilisationData = new Set(existingFacilityUtilisationDataEntities.map((entity) => entity.id));

    return facilityIds.difference(facilityIdsWithExistingUtilisationData);
  }
}
