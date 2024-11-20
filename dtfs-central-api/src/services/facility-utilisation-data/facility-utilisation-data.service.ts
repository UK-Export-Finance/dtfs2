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
    const facilityIdsToInitialise = await this.filterOutFacilitiesWithExistingUtilisationData(facilityIds, entityManager);

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

  public static async filterOutFacilitiesWithExistingUtilisationData(facilityIds: Set<string>, entityManager: EntityManager): Promise<Set<string>> {
    const existingFacilityUtilisationDataEntities = await entityManager.findBy(FacilityUtilisationDataEntity, { id: In(Array.from(facilityIds)) });

    const facilityIdsWithExistingUtilisationData = new Set(existingFacilityUtilisationDataEntities.map((entity) => entity.id));

    return facilityIds.difference(facilityIdsWithExistingUtilisationData);
  }
}
