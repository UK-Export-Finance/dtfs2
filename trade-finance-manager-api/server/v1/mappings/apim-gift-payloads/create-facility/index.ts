import { BssEwcsDeal, TfmDeal, TfmFacility, getTfmUkefDealId } from '@ukef/dtfs2-common';
import { FacilityCategory } from '../../../api-response-types';
import { APIM_GIFT_INTEGRATION } from '../constants';
import { ApimGiftFacilityCreationPayload } from '../types';
import { getFacilityTypeFlags } from './get-facility-type-flags';
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
import { mapFacilityAmount } from './map-overview/map-facility-amount';

export type FacilityCreationParams = {
  creditRiskRatings: string[];
  deal: TfmDeal;
  facility: TfmFacility;
  facilityCategories: FacilityCategory[];
  isBssEwcsDeal: boolean;
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
 * @param {boolean} params.newPartyUrnCreated - A boolean indicating whether a new party URN was created for the exporter, which determines how certain facility values are mapped.
 * @returns {Promise<ApimGiftFacilityCreationPayload>} The APIM "GIFT facility creation" payload.
 */
export const createFacility = async ({
  creditRiskRatings,
  deal,
  facility,
  facilityCategories,
  isBssEwcsDeal,
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

  const { type: facilityType } = facilitySnapshot;

  const { isBssFacility, isCashFacility, isContingentFacility, isEwcsFacility } = getFacilityTypeFlags(facilityType);

  const coverPercentage = mapCoverPercentage({
    facilitySnapshot,
    isBssFacility,
    isCashFacility,
    isContingentFacility,
    isEwcsFacility,
  });

  const { feeFrequency, feeType } = facilitySnapshot;

  const facilityAmount = mapFacilityAmount({
    facilityAmount: facilitySnapshot.value,
    coverPercentage,
  });

  const monthsOfCover = Number(tfm.exposurePeriodInMonths);

  /**
   * Ensure dayCountBasis is a number.
   * GEF stores this as a number, BSS/EWCS stores this as a string.
   * Number is cleanest.
   */
  const dayCountBasis = Number(facilitySnapshot.dayCountBasis);

  const productTypeCode = mapProductTypeCode({
    isBssFacility,
    isCashFacility,
    isContingentFacility,
    isEwcsFacility,
  });

  const { exporterCreditRating } = deal.tfm;

  const partyUrns = mapPartyUrns({
    deal,
    isBssFacility,
    isCashFacility,
    isContingentFacility,
    isEwcsFacility,
  });

  const { exporterPartyUrn } = partyUrns;

  const bssSubtypeName = isBssEwcsDeal ? String(facility.facilitySnapshot.bondType) : undefined;

  const industryCode = getIndustryCode(deal);

  const guaranteeFeePayableToUkef = getGuaranteeFeePayableToUkef({
    facilitySnapshot,
    isBssFacility,
    isCashFacility,
    isContingentFacility,
    isEwcsFacility,
  });

  let ewcsSupplierType = null;

  if (isEwcsFacility) {
    const ewcsDeal = deal.dealSnapshot as BssEwcsDeal;

    ewcsSupplierType = String(ewcsDeal.submissionDetails['supplier-type']);
  }

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
      isBssFacility,
      isCashFacility,
      isContingentFacility,
      isEwcsFacility,
      partyUrns,
    }),
    obligations: mapObligations({
      bssSubtypeName,
      currency,
      facilityAmount,
      isBssFacility,
      isCashFacility,
      isContingentFacility,
      isEwcsFacility,
    }),
    riskDetails: await mapRiskDetails({
      creditRiskRatings,
      dealId,
      ewcsSupplierType,
      exporterCreditRating,
      facilityCategories,
      facilityType,
      industryCode,
      isCashFacility,
      isContingentFacility,
      isEwcsFacility,
    }),
    delayCreation,
  };

  return mapped;
};
