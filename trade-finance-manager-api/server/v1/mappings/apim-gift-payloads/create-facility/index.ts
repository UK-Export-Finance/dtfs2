import { TfmFacility } from '@ukef/dtfs2-common';
import { mapOverview } from './map-overview';
import { mapRiskDetails } from './map-risk-details';
import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../constants';
import { ApimGiftFacilityCreationPayload } from '../types';

export type FacilityCreationParams = {
  dealId: string;
  exporterPartyUrn: string;
  facility: TfmFacility;
};

/**
 * Map DTFS facility data to the format expected by APIM for "GIFT facility creation".
 * @param {FacilityCreationParams} params - Data required to build the APIM "GIFT facility creation" payload.
 * @param {string} params.dealId - The TFM deal ID.
 * @param {string} params.exporterPartyUrn - The TFM exporter party URN, from deal data.
 * @param {TfmFacility} params.facility - The TFM facility data containing `facilitySnapshot` and `tfm` values.
 * @returns {ApimGiftFacilityCreationPayload} The APIM "GIFT facility creation" payload.
 */
export const createFacility = ({ dealId, exporterPartyUrn, facility }: FacilityCreationParams): ApimGiftFacilityCreationPayload => {
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
