import { EntityManager } from 'typeorm';
import { DbRequestSource, FacilityUtilisationDataEntity, ReportPeriod } from '@ukef/dtfs2-common';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';

type UpdateFacilityUtilisationDataUpdate = {
  entityManager: EntityManager;
  reportPeriod: ReportPeriod;
  utilisation: number;
  requestSource: DbRequestSource;
};

/**
 * Updates a facility utilisation data entity with the supplied report period
 * and the fixed fee calculated relative to the new report period
 * @param facilityUtilisationDataEntity - The facility utilisation data entity to update
 * @param update - The values to update the entity with
 * @param update.reportPeriod - The report period to update with
 * @param update.utilisation - The utilisation to update with
 * @param update.requestSource - The request source supplying the update
 * @param update.entityManager - The entity manager
 * @returns The updated entity
 */
export const updateFacilityUtilisationData = async (
  facilityUtilisationDataEntity: FacilityUtilisationDataEntity,
  { reportPeriod, utilisation, requestSource, entityManager }: UpdateFacilityUtilisationDataUpdate,
): Promise<FacilityUtilisationDataEntity> => {
  const nextReportPeriodFixedFee = await getFixedFeeForFacility(facilityUtilisationDataEntity.id, utilisation, reportPeriod);

  facilityUtilisationDataEntity.updateWithFixedFeeUtilisationAndReportPeriod({
    fixedFee: nextReportPeriodFixedFee,
    utilisation,
    reportPeriod,
    requestSource,
  });
  return await entityManager.save(FacilityUtilisationDataEntity, facilityUtilisationDataEntity);
};
