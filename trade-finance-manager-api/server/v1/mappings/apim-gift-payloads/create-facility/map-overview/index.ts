import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../../constants';
import { ApimGiftFacilityOverview } from '../../types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapOverviewParams = {
  facilityAmount: number;
  facilityName: string;
  currency: string;
  effectiveDate: string;
  expiryDate: string;
  exporterPartyUrn: string;
  productTypeCode: (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES];
  ukefFacilityId: string;
};

/**
 * Map the facility "overview".
 * @param {MapOverviewParams} params - Data required to build the APIM GIFT "facility overview" data.
 * @param {string} params.currency - The facility currency code.
 * @param {string} params.effectiveDate - The facility guarantee commencement/effective date.
 * @param {string} params.expiryDate - The facility guarantee expiry date.
 * @param {string} params.exporterPartyUrn - The exporter/obligor party URN.  This is from the deal data and is not facility specific, but is required for the "overview" section of the payload.
 * @param {number} params.facilityAmount - The total facility amount.
 * @param {string} params.facilityName - The facility name.
 * @param {(typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]} params.productTypeCode - The APIM GIFT product type code for the facility.
 * @param {string} params.ukefFacilityId - The UKEF facility identifier.
 * @returns {ApimGiftFacilityOverview} The mapped facility overview data.
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
}: MapOverviewParams): ApimGiftFacilityOverview => ({
  creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE[productTypeCode],
  currency,
  facilityAmount,
  facilityId: ukefFacilityId,
  facilityName,
  effectiveDate,
  expiryDate,
  isRevolving: DEFAULTS.OVERVIEW.IS_REVOLVING[productTypeCode],
  obligorUrn: exporterPartyUrn,
  productTypeCode,
});
