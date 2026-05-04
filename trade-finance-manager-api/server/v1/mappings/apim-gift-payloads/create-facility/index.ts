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

export type FacilityCreationParams = {
  deal: TfmDeal;
  facility: TfmFacility;
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
  creditRiskRatings: string[];
  facilityCategories: FacilityCategory[];
};

/**
 * Map DTFS facility data to the format expected by APIM for "GIFT facility creation".
 * @param {FacilityCreationParams} params - Data required to build the APIM "GIFT facility creation" payload.
 * @param {TfmDeal} params.deal - Deal data, required for mapping certain facility values.
 * @param {TfmFacility} params.facility - The TFM facility data containing `facilitySnapshot` and `tfm` values.
 * @param {boolean} params.isBssEwcsDeal - A boolean indicating whether the deal is a BSS/EWCS deal, which determines how certain facility values are mapped.
 * @param {boolean} params.isGefDeal - A boolean indicating whether the deal is a GEF deal, which determines how certain facility values are mapped.
 * @param {string[]} params.creditRiskRatings - An array of credit risk rating descriptions from APIM, required for mapping the facility credit risk rating to the format expected by APIM.
 * @param {FacilityCategory[]} params.facilityCategories - An array of facility categories from APIM, required for mapping the facility category to the format expected by APIM.
 * @returns {Promise<ApimGiftFacilityCreationPayload>} The APIM "GIFT facility creation" payload.
 */
export const createFacility = async ({
  deal,
  facility,
  isBssEwcsDeal,
  isGefDeal,
  creditRiskRatings,
  facilityCategories,
}: FacilityCreationParams): Promise<ApimGiftFacilityCreationPayload> => {
  const { dealSnapshot } = deal;
  const { bankInternalRefName } = dealSnapshot;

  const { facilitySnapshot, tfm } = facility;

  const { facilityGuaranteeDates } = tfm;

  const consumer = APIM_GIFT_INTEGRATION.CONSUMER;

  const currency = facilitySnapshot.currency.id;

  const effectiveDate = String(facilityGuaranteeDates?.guaranteeCommencementDate);
  const expiryDate = String(facilityGuaranteeDates?.guaranteeExpiryDate);

  const facilityAmount = Number(tfm.ukefExposure);
  const { feeFrequency, feeType, type: facilityType } = facilitySnapshot;

  /**
   * Ensure dayCountBasis is a number.
   * GEF stores this as a number, BSS/EWCS stores this as a string.
   * Number is cleanest.
   */
  const dayCountBasis = Number(facilitySnapshot.dayCountBasis);

  const dealId = getTfmUkefDealId(deal);

  const productTypeCode = mapProductTypeCode({
    isBssEwcsDeal,
    isGefDeal,
    facilityCategoryCode: facilityType,
  });

  const ukefFacilityId = String(facilitySnapshot.ukefFacilityId);

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

  const mapped: ApimGiftFacilityCreationPayload = {
    consumer,
    overview: mapOverview({
      bankInternalRefName,
      currency,
      effectiveDate,
      expiryDate,
      exporterPartyUrn,
      facilityAmount,
      facilityType,
      isGefDeal,
      productTypeCode,
      ukefFacilityId,
    }),
    accrualSchedules: mapAccrualSchedules({
      effectiveDate,
      maturityDate: expiryDate,
      dayCountBasis,
      feeFrequency,
      feeType,
      guaranteeFeePayableToUkef,
    }),
    counterparties: mapCounterparties({
      isBssEwcsDeal,
      isGefDeal,
      partyUrns,
      startDate: effectiveDate,
      exitDate: expiryDate,
    }),
    obligations: mapObligations({
      bssSubtypeName,
      currency,
      effectiveDate,
      isBssEwcsDeal,
      facilityType,
      isGefDeal,
      maturityDate: expiryDate,
      ukefExposure: facilityAmount,
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
  };

  return mapped;
};
