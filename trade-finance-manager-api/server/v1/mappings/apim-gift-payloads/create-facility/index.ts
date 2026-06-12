import { TfmDeal, TfmFacility, getTfmUkefDealId } from '@ukef/dtfs2-common';
import { FacilityCategory } from '../../../api-response-types';
import { APIM_GIFT_INTEGRATION } from '../constants';
import { ApimGiftFacilityCreationPayload } from '../types';
import { mapPartyUrns } from './map-party-urns';
import { getIndustryCode } from '../get-industry-code';
import { mapOverview } from './map-overview';
import { mapAccrualSchedules } from './map-accrual-schedules';
import { mapCounterparties } from './map-counterparties';
import { mapRiskDetails } from './map-risk-details';
import { mapObligations } from './map-obligations';
import { mapProductTypeCode } from './map-product-type-code';
import { getGuaranteeFeePayableToUkef } from './get-guarantee-fee-payable-to-ukef';
import { mapCoverPercentage } from './map-cover-percentage';
import { getMonthsOfCover } from './get-months-of-cover';

export type FacilityCreationParams = {
  creditRiskRatings: string[];
  deal: TfmDeal;
  facility: TfmFacility;
  facilityCategories: FacilityCategory[];
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
  newPartyUrnCreated: boolean;
};

/**
 * Map DTFS facility data to the format expected by APIM for "GIFT facility creation".
 * @param {FacilityCreationParams} params - Data required to build the APIM "GIFT facility creation" payload.
 * @param {string[]} params.creditRiskRatings - An array of credit risk rating descriptions from APIM, required for mapping the facility credit risk rating to the format expected by APIM.
 * @param {TfmDeal} params.deal - Deal data, required for mapping certain facility values.
 * @param {TfmFacility} params.facility - The TFM facility data containing `facilitySnapshot` and `tfm` values.
 * @param {FacilityCategory[]} params.facilityCategories - An array of facility categories from APIM, required for mapping the facility category to the format expected by APIM.
 * @param {boolean} params.isBssEwcsDeal - A boolean indicating whether the deal is a BSS/EWCS deal, which determines how certain facility values are mapped.
 * @param {boolean} params.isGefDeal - A boolean indicating whether the deal is a GEF deal, which determines how certain facility values are mapped.
 * @param {boolean} params.newPartyUrnCreated - A boolean indicating whether a new party URN was created for the exporter, which determines how certain facility values are mapped.
 * @returns {Promise<ApimGiftFacilityCreationPayload>} The APIM "GIFT facility creation" payload.
 */
export const createFacility = async ({
  creditRiskRatings,
  deal,
  facility,
  facilityCategories,
  isBssEwcsDeal,
  isGefDeal,
  newPartyUrnCreated,
}: FacilityCreationParams): Promise<ApimGiftFacilityCreationPayload> => {
  const ukefFacilityId = String(facility?.facilitySnapshot?.ukefFacilityId);

  console.info('Mapping facility %s for APIM GIFT', ukefFacilityId);

  const dealId = getTfmUkefDealId(deal);

  const { facilitySnapshot, tfm } = facility;

  const { facilityGuaranteeDates } = tfm;

  const consumer = APIM_GIFT_INTEGRATION.CONSUMER;

  const currency = facilitySnapshot.currency.id;

  const effectiveDate = String(facilityGuaranteeDates?.guaranteeCommencementDate);
  const expiryDate = String(facilityGuaranteeDates?.guaranteeExpiryDate);

  const ukefExposure = Number(tfm.ukefExposure);

  /**
   * GEF "value" field is a number.
   * BSS/EWCS "value" field is a string with commas.
   */
  const facilityAmount = Number(String(facilitySnapshot.value).replace(/,/g, ''));

  const { feeFrequency, feeType, type: facilityType } = facilitySnapshot;

  const coverPercentage = mapCoverPercentage({
    facilitySnapshot,
    isBssEwcsDeal,
    isGefDeal,
  });

  const monthsOfCover = getMonthsOfCover({
    facilitySnapshot,
    isBssEwcsDeal,
    isGefDeal,
  });

  /**
   * Ensure dayCountBasis is a number.
   * GEF stores this as a number, BSS/EWCS stores this as a string.
   * Number is cleanest.
   */
  const dayCountBasis = Number(facilitySnapshot.dayCountBasis);

  const productTypeCode = mapProductTypeCode({
    isBssEwcsDeal,
    isGefDeal,
    facilityCategoryCode: facilityType,
  });

  const { exporterCreditRating } = deal.tfm;

  const partyUrns = mapPartyUrns({
    deal,
    isBssEwcsDeal,
    isGefDeal,
  });

  const { exporterPartyUrn } = partyUrns;

  const bssSubtypeName = isBssEwcsDeal ? String(facility.facilitySnapshot.bondType) : undefined;

  const industryCode = getIndustryCode(deal);

  const guaranteeFeePayableToUkef = getGuaranteeFeePayableToUkef({
    facilitySnapshot,
    isBssEwcsDeal,
    isGefDeal,
  });

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
      coverPercentage,
      currency,
      effectiveDate,
      expiryDate,
      exporterPartyUrn,
      facilityAmount,
      facilityType,
      isGefDeal,
      monthsOfCover,
      productTypeCode,
      ukefFacilityId,
    }),
    accrualSchedules: mapAccrualSchedules({
      dayCountBasis,
      feeFrequency,
      feeType,
      guaranteeFeePayableToUkef,
    }),
    counterparties: mapCounterparties({
      isBssEwcsDeal,
      isGefDeal,
      partyUrns,
    }),
    obligations: mapObligations({
      bssSubtypeName,
      currency,
      facilityType,
      isBssEwcsDeal,
      isGefDeal,
      ukefExposure,
    }),
    riskDetails: await mapRiskDetails({
      creditRiskRatings,
      dealId,
      exporterCreditRating,
      facilityCategories,
      facilityType,
      industryCode,
      isGefDeal,
    }),
    delayCreation,
  };

  return mapped;
};
