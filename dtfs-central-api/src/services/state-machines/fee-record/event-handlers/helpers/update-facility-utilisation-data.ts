import { EntityManager } from 'typeorm';
import { DbRequestSource, FacilityUtilisationDataEntity, ReportPeriod } from '@ukef/dtfs2-common';
import { getFixedFeeForFacility } from './get-fixed-fee-for-facility';
import { LatestTfmFacilityValues } from '../../../../../types/tfm/tfm-facility';

type UpdateFacilityUtilisationDataUpdate = {
  entityManager: EntityManager;
  reportPeriod: ReportPeriod;
  utilisation: number;
  ukefShareOfUtilisation: number;
  requestSource: DbRequestSource;
};

/**
 * Updates a facility utilisation data entity with the supplied update values and
 * calculates the new fixed fee using the updated values
 * @param facilityUtilisationDataEntity - The facility utilisation data entity to update
 * @param update - The values to update the entity with
 * @param update.reportPeriod - The report period to update with
 * @param update.utilisation - The utilisation as reported by the bank
 * @param update.ukefShareOfUtilisation - UKEF's share of the utilisation as reported by the bank
 * @param update.requestSource - The request source supplying the update
 * @param update.entityManager - The entity manager
 * @param tfmFacilityValues - TFM facility values
 * @returns The updated entity
 */
export const updateFacilityUtilisationData = async (
  facilityUtilisationDataEntity: FacilityUtilisationDataEntity,
  { reportPeriod, utilisation, requestSource, entityManager, ukefShareOfUtilisation }: UpdateFacilityUtilisationDataUpdate,
  tfmFacilityValues: LatestTfmFacilityValues,
): Promise<FacilityUtilisationDataEntity> => {
  const nextReportPeriodFixedFee = getFixedFeeForFacility(utilisation, reportPeriod, tfmFacilityValues);

  facilityUtilisationDataEntity.updateWithCurrentReportPeriodDetails({
    fixedFee: nextReportPeriodFixedFee,
    utilisation: ukefShareOfUtilisation,
    reportPeriod,
    requestSource,
  });
  return await entityManager.save(FacilityUtilisationDataEntity, facilityUtilisationDataEntity);
};
