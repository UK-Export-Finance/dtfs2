import { TfmFacility } from '@ukef/dtfs2-common';
import { mapOverview } from './map-overview';
import { mapRiskDetails } from './map-risk-details';
import { APIM_GIFT_INTEGRATION } from '../constants';

export type FacilityCreationParams = {
  dealId: string;
  exporterPartyUrn: string;
  facility: TfmFacility;
};

// TODO:
// export type FacilityCreationReturnType = ReturnType<typeof facilityCreation>;

/**
 * Map DTFS facility data to the format expected by APIM GIFT for facility creation
 * @param {FacilityCreationParams} params - Data required to build the APIM GIFT "facility creation" payload.
 * @param {string} params.dealId - The TFM deal ID.
 * @param {string} params.exporterPartyUrn - The TFM exporter party URN, from deal data.
 * @param {TfmFacility} params.facility - The TFM facility data containing `facilitySnapshot` and `tfm` values.
 * @returns TODO
 */
export const facilityCreation = ({ dealId, exporterPartyUrn, facility }: FacilityCreationParams) => {
  const { facilitySnapshot, tfm } = facility;

  const { facilityGuaranteeDates } = tfm;

  const consumer = APIM_GIFT_INTEGRATION.CONSUMER;
  const currency = facilitySnapshot.currency.id;

  const effectiveDate = String(facilityGuaranteeDates?.guaranteeCommencementDate);
  const expiryDate = String(facilityGuaranteeDates?.guaranteeExpiryDate);

  const facilityCategoryCode = String(facilitySnapshot.type);
  const facilityName = facilitySnapshot.name;
  const facilityAmount = String(tfm.ukefExposure);
  const productTypeCode = 'BSS'; // TODO - mapping (via constants?) no hard coding.
  const ukefFacilityId = String(facilitySnapshot.ukefFacilityId);

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
    counterparties: [], // TODO: DTFS2-8314
    obligations: [], // TODO: DTFS2-8315
    repaymentProfiles: [], // TODO: DTFS2-8316
    riskDetails: mapRiskDetails({
      dealId,
      productTypeCode,
      facilityCategoryCode,
    }),
  };

  return mapped;
};

// TODO
// Tony temporary notes
// BSS - deal has dealType - BSS/EWCS. Facility has facilities[0].type = 'Bond' < only ever this or 'Loan'?
// GEF - deal has dealType GEF. Facility has facilities[0].type = 'Bond' | 'Cash' | 'Contingent' | 'Loan' < more variety of types than BSS, but still a defined list of types. Note - these types are not necessarily the same as the facility types in BSS, e.g. BSS has 'Bond' but not 'Cash', GEF has both.
// So - we can determine whether it's a BSS or GEF facility based on the dealType, and then determine the productTypeCode based on the facility type, but we will need to do some mapping as the facility types in DTFS don't necessarily match the product types expected by APIM GIFT. For example, a BSS Bond facility would have type 'Bond' in DTFS, but the productTypeCode expected by APIM GIFT might be 'BSS_BOND' or something like that. We will need to create a mapping function to map from DTFS facility types to APIM GIFT productTypeCodes, and this mapping function will need to take into account the dealType as well as the facility type.

// BSS - deal.dealSnapshot.details.ukefDealId
// GEF - deal.dealSnapshot.ukefDealId
