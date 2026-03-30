import { TfmDeal, TfmFacility, getTfmUkefDealId } from '@ukef/dtfs2-common';
import { CreditRiskRating, FacilityCategory } from '../../../api-response-types';
import { APIM_GIFT_INTEGRATION } from '../constants';
import { ApimGiftFacilityCreationPayload } from '../types';
import apiModule from '../../../api';
import { getDealTypeFlags } from './get-deal-type-flags';
import { mapPartyUrns } from './map-party-urns';
import { getIndustryCode } from '../get-industry-code';
import { mapOverview } from './map-overview';
import { mapApimCreditRiskRatings } from '../../map-apim-credit-risk-ratings';
import { mapRepaymentProfiles } from './map-repayment-profiles';
import { mapCounterparties } from './map-counterparties';
import { mapRiskDetails } from './map-risk-details';
import { mapObligations } from './map-obligations';
import { mapProductTypeCode } from './map-product-type-code';

export type FacilityCreationParams = {
  deal: TfmDeal;
  facility: TfmFacility;
};

type ApiTypes = {
  getCreditRiskRatings: () => Promise<CreditRiskRating[]>;
  getFacilityCategories: () => Promise<FacilityCategory[]>;
};

/**
 * Map DTFS facility data to the format expected by APIM for "GIFT facility creation".
 * @param {FacilityCreationParams} params - Data required to build the APIM "GIFT facility creation" payload.
 * @param {TfmDeal} params.deal - Deal data, required for mapping certain facility values.
 * @param {TfmFacility} params.facility - The TFM facility data containing `facilitySnapshot` and `tfm` values.
 * @returns {Promise<ApimGiftFacilityCreationPayload>} The APIM "GIFT facility creation" payload.
 */
export const createFacility = async ({ deal, facility }: FacilityCreationParams): Promise<ApimGiftFacilityCreationPayload> => {
  const api = apiModule as ApiTypes;

  const { dealSnapshot } = deal;
  const { facilitySnapshot, tfm } = facility;

  const { facilityGuaranteeDates } = tfm;

  const consumer = APIM_GIFT_INTEGRATION.CONSUMER;
  const currency = facilitySnapshot.currency.id;

  const effectiveDate = String(facilityGuaranteeDates?.guaranteeCommencementDate);
  const expiryDate = String(facilityGuaranteeDates?.guaranteeExpiryDate);

  const facilityType = facilitySnapshot.type;
  const facilityAmount = Number(tfm.ukefExposure); // TODO: DTFS2-8306 is this correct?

  const dealId = getTfmUkefDealId(deal);

  const { bankInternalRefName, dealType } = dealSnapshot;

  const { isBssEwcsDeal, isGefDeal } = getDealTypeFlags(dealType);

  const productTypeCode = mapProductTypeCode({
    isBssEwcsDeal,
    isGefDeal,
    facilityCategoryCode: facilityType,
  });

  const ukefFacilityId = String(facilitySnapshot.ukefFacilityId);

  const { exporterCreditRating, parties } = deal.tfm;
  const exporterPartyUrn = parties.exporter.partyUrn;

  const partyUrns = mapPartyUrns({
    deal,
    isBssEwcsDeal,
    isGefDeal,
  });

  const industryCode = getIndustryCode(deal);

  const bssSubtypeName = isBssEwcsDeal ? String(facility.facilitySnapshot.bondType) : undefined;

  /**
   * Get data from APIM MDM required to map the APIM GIFT payload:
   * - "credit risk ratings"
   * - "facility categories"
   *
   * NOTE: if this API call fails, we do NOT want to throw an error.
   * Instead, continue with an empty array of credit risk ratings, which could result in the facility credit rating not being mapped.
   * But at least the facility can still be created in GIFT and the issue can be investigated separately.
   * If the credit risk rating mapping fails, the facility credit rating will simply not be sent to GIFT, which is preferable to the entire facility creation failing.
   * Ultimately, this will trigger an alert in APIM for the failed API call, which can be investigated by the team.
   * The alternative of this would be to have retry logic in DTFS, but given the low likelihood of the API call failing and the fact that the credit risk rating mapping can be "best effort", this is not necessary.
   * Note that this is an edge case scenario as 99% of credit risk ratings are in TFM_CREDIT_RATING_MAP and do not require the API call to map the facility credit rating.
   */
  let creditRiskRatingsResponse: CreditRiskRating[] = [];

  try {
    creditRiskRatingsResponse = await api.getCreditRiskRatings();
  } catch {
    // Swallow errors and default creditRiskRatingsResponse to an empty array
    creditRiskRatingsResponse = [];
  }

  let facilityCategoriesResponse: FacilityCategory[] = [];

  if (isGefDeal) {
    try {
      facilityCategoriesResponse = await api.getFacilityCategories();
    } catch {
      // Swallow errors and default facilityCategoriesResponse to an empty array
      facilityCategoriesResponse = [];
    }
  }

  const facilityCategories = Array.isArray(facilityCategoriesResponse) ? facilityCategoriesResponse : [];

  const creditRiskRatings = mapApimCreditRiskRatings(creditRiskRatingsResponse);

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
    repaymentProfiles: mapRepaymentProfiles({
      amount: facilityAmount,
      dueDate: expiryDate,
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
