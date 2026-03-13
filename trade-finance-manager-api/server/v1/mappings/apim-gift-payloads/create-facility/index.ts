import { TfmDeal, TfmFacility, getTfmUkefDealId } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../constants';
import { ApimGiftFacilityCreationPayload } from '../types';
import api from '../../../api';
import { mapApimCreditRiskRatings } from '../../map-apim-credit-risk-ratings';
import { mapOverview } from './map-overview';
import { mapCounterparties } from './map-counterparties';
import { mapRiskDetails } from './map-risk-details';
import { getPartyUrns } from './get-party-urns';
import { getIndustryCode } from '../get-industry-code';

export type FacilityCreationParams = {
  deal: TfmDeal;
  facility: TfmFacility;
};

/**
 * Map DTFS facility data to the format expected by APIM for "GIFT facility creation".
 * @param {FacilityCreationParams} params - Data required to build the APIM "GIFT facility creation" payload.
 * @param {TfmDeal} params.deal - Deal data, required for mapping certain facility values.
 * @param {TfmFacility} params.facility - The TFM facility data containing `facilitySnapshot` and `tfm` values.
 * @returns {Promise<ApimGiftFacilityCreationPayload>} The APIM "GIFT facility creation" payload.
 */
export const createFacility = async ({ deal, facility }: FacilityCreationParams): Promise<ApimGiftFacilityCreationPayload> => {
  const { facilitySnapshot, tfm } = facility;

  const { facilityGuaranteeDates } = tfm;

  const consumer = APIM_GIFT_INTEGRATION.CONSUMER;
  const currency = facilitySnapshot.currency.id;

  const effectiveDate = String(facilityGuaranteeDates?.guaranteeCommencementDate);
  const expiryDate = String(facilityGuaranteeDates?.guaranteeExpiryDate);

  const facilityCategoryCode = String(facilitySnapshot.type);
  const facilityName = facilitySnapshot.name;
  const facilityAmount = Number(tfm.ukefExposure);
  const productTypeCode = PRODUCT_TYPES.BSS; // TODO: DTFS2-8307

  const dealId = getTfmUkefDealId(deal);
  const { dealType } = deal.dealSnapshot;

  const ukefFacilityId = String(facilitySnapshot.ukefFacilityId);

  const { exporterCreditRating } = deal.tfm;
  const exporterPartyUrn = deal.tfm.parties.exporter.partyUrn;

  const partyUrns = getPartyUrns(deal);
  const industryCode = getIndustryCode(deal);

  /**
   * Get credit risk ratings from APIM MDM and map it into a simple array of strings.
   *
   * NOTE: if this API call fails, we do NOT want to throw an error.
   * Instead, continue with an empty array of credit risk ratings, which could result in the facility credit rating not being mapped.
   * But at least the facility can still be created in GIFT and the issue can be investigated separately.
   * If the credit risk rating mapping fails, the facility credit rating will simply not be sent to GIFT, which is preferable to the entire facility creation failing.
   * Ultimately, this will trigger an alert in APIM for the failed API call, which can be investigated by the team.
   * The alternative of this would be to have retry logic in DTFS, but given the low likelihood of the API call failing and the fact that the credit risk rating mapping can be "best effort", this is not necessary.
   * Note that this is an edge case scenario as 99% of credit risk ratings are in TFM_CREDIT_RATING_MAP and do not require the API call to map the facility credit rating.
   *
   * Lastly - Unfortunately, because the "api" module is in JS, we lose type information and eslint-disable-next-line has to be used.
   */
  let creditRiskRatingsResponse: unknown = [];

  try {
    creditRiskRatingsResponse = await api.getCreditRiskRatings();
  } catch {
    // Swallow errors and default creditRiskRatingsResponse to an empty array
    creditRiskRatingsResponse = [];
  }

  const creditRiskRatings = mapApimCreditRiskRatings(creditRiskRatingsResponse);

  const mapped = {
    consumer,
    overview: mapOverview({
      currency,
      effectiveDate,
      expiryDate,
      exporterPartyUrn,
      facilityAmount,
      facilityName,
      productTypeCode,
      ukefFacilityId,
    }),
    counterparties: mapCounterparties({
      dealType,
      partyUrns,
      startDate: effectiveDate,
      exitDate: expiryDate,
    }),
    obligations: [], // TODO: DTFS2-8315
    repaymentProfiles: [], // TODO: DTFS2-8316
    riskDetails: await mapRiskDetails({
      creditRiskRatings,
      dealId,
      exporterCreditRating,
      facilityCategoryCode,
      industryCode,
      productTypeCode,
    }),
  };

  return mapped;
};
