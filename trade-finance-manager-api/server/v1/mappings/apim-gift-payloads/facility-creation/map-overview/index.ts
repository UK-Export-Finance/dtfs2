import { APIM_GIFT_INTEGRATION } from '../../constants';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

export type MapOverviewParams = {
  facilityAmount: number;
  facilityName: string;
  currency: string;
  effectiveDate: string;
  expiryDate: string;
  exporterPartyUrn: string;
  productTypeCode: string;
  ukefFacilityId: string;
};

type MappedOverview = {
  creditType: string;
  currency: string;
  effectiveDate: string;
  expiryDate: string;
  facilityAmount: number;
  facilityId: string;
  facilityName: string;
  isRevolving: boolean;
  obligorUrn: string;
  productTypeCode: string; // TODO: DTFS2-8307 - typing
};

/**
 * Map the facility "overview"
 * @param {MapOverviewParams} params - Data required to build the APIM GIFT "facility overview" data.
 * @param {string} params.currency - The facility currency code.
 * @param {string} params.effectiveDate - The facility guarantee commencement/effective date.
 * @param {string} params.expiryDate - The facility guarantee expiry date.
 * @param {string} params.exporterPartyUrn - The exporter/obligor party URN.  This is from the deal data and is not facility specific, but is required for the "overview" section of the payload.
 * @param {number} params.facilityAmount - The total facility amount.
 * @param {string} params.facilityName - The facility name.
 * @param {string} params.productTypeCode - The APIM GIFT product type code for the facility.
 * @param {string} params.ukefFacilityId - The UKEF facility identifier.
 * @returns {MappedOverview} The mapped facility overview data.
 */
export const mapOverview = ({
  currency,
  effectiveDate,
  expiryDate,
  exporterPartyUrn,
  facilityAmount,
  facilityName,
  productTypeCode,
  ukefFacilityId,
}: MapOverviewParams): MappedOverview => ({
  creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE.BSS, // TODO: DTFS2-8307 - based on product type
  currency,
  facilityAmount,
  facilityId: ukefFacilityId,
  facilityName,
  effectiveDate,
  expiryDate,
  isRevolving: DEFAULTS.OVERVIEW.IS_REVOLVING.BSS, // TODO: DTFS2-8308 - based on product type
  obligorUrn: exporterPartyUrn,
  productTypeCode,
});
