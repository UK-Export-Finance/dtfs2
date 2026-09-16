import { TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { FacilityCategory } from '../../../api-response-types';
import { ApimGiftFacilityCreationPayload } from '../types';
import { mapOverview } from './map-overview';
import { mapAccrualSchedules } from './map-accrual-schedules';
import { mapCounterparties } from './map-counterparties';
import { mapRiskDetails } from './map-risk-details';
import { mapObligations } from './map-obligations';
import { getFieldValues } from './get-field-values';

export type FacilityCreationParams = {
  deal: TfmDeal;
  facility: TfmFacility;
  facilityCategories: FacilityCategory[];
  newPartyUrnCreated: boolean;
};

/**
 * Map DTFS facility data to the format expected by APIM for "GIFT facility creation".
 * @param {FacilityCreationParams} params - Data required to build the APIM "GIFT facility creation" payload.
 * @param {string[]} params.creditRiskRatings - An array of credit risk rating descriptions from APIM, required for mapping the facility credit risk rating to the format expected by APIM.
 * @param {TfmDeal} params.deal - Deal data, required for mapping certain facility values.
 * @param {TfmFacility} params.facility - The TFM facility data containing `facilitySnapshot` and `tfm` values.
 * @param {FacilityCategory[]} params.facilityCategories - An array of facility categories from APIM, required for mapping the facility category to the format expected by APIM.
 * @param {boolean} params.newPartyUrnCreated - A boolean indicating whether a new party URN was created for the exporter, which determines how certain facility values are mapped.
 * @returns {Promise<ApimGiftFacilityCreationPayload>} The APIM "GIFT facility creation" payload.
 */
export const createFacility = async ({
  deal,
  facility,
  facilityCategories,
  newPartyUrnCreated,
}: FacilityCreationParams): Promise<ApimGiftFacilityCreationPayload> => {
  const ukefFacilityId = String(facility?.facilitySnapshot?.ukefFacilityId);

  console.info('Mapping facility %s for APIM GIFT', ukefFacilityId);

  const {
    bssSubtypeName,
    consumer,
    currency,
    dayCountBasis,
    dealId,
    effectiveDate,
    ewcsSupplierType,
    expiryDate,
    exporterCreditRating,
    facilityAmount,
    facilityFlags,
    facilityType,
    feeFrequency,
    feeType,
    guaranteeFeePayableToUkef,
    industryCode,
    monthsOfCover,
    partyUrns,
    productTypeCode,
  } = getFieldValues({ deal, facility });

  const { isCashFacility, isContingentFacility, isEwcsFacility } = facilityFlags;

  const { exporterPartyUrn } = partyUrns;

  /**
   * If DTFS has created a new exporter party URN,
   * we need to tell APIM TFS to delay sending the facility to GIFT. This is because:
   * - During DTFS deal submission, it instantly creates a new party URN in Salesforce (via APIM).
   * - GIFT calls ODS (via APIM) to check if the exporter party URN exists before creating a facility.
   * - ODS does not instantly have the new party URN from Salesforce. It refreshes every X hours.
   *
   * Therefore, we need to flag to APIM that a new party URN has been added.
   * Otherwise, the facility creation will fail in GIFT with a 400 error, because the exporter party URN does not exist in ODS yet.
   */
  const delayCreation = newPartyUrnCreated;

  const mapped: ApimGiftFacilityCreationPayload = {
    consumer,
    overview: mapOverview({
      currency,
      effectiveDate,
      expiryDate,
      exporterPartyUrn,
      facilityAmount,
      facilityType,
      isCashFacility,
      isContingentFacility,
      monthsOfCover,
      productTypeCode,
      ukefFacilityId,
    }),
    accrualSchedules: mapAccrualSchedules({
      currency,
      dayCountBasis,
      expiryDate,
      feeFrequency,
      feeType,
      guaranteeFeePayableToUkef,
      isEwcsFacility,
    }),
    counterparties: mapCounterparties({
      ...facilityFlags,
      partyUrns,
    }),
    obligations: mapObligations({
      bssSubtypeName,
      currency,
      facilityAmount,
      ...facilityFlags,
    }),
    riskDetails: await mapRiskDetails({
      dealId,
      ewcsSupplierType,
      exporterCreditRating,
      facilityCategories,
      isCashFacility,
      isContingentFacility,
      isEwcsFacility,
      facilityType,
      industryCode,
    }),
    delayCreation,
  };

  return mapped;
};
