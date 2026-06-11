import { Currency } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftFacilityOverview, ApimGiftProductTypeCode } from '../../types';
import { mapFacilityAmount } from './map-facility-amount';
import { mapFacilityName } from './map-facility-name';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapOverviewParams = {
  bankInternalRefName: string;
  coverPercentage: number | null;
  currency: Currency;
  effectiveDate: string;
  expiryDate: string;
  exporterPartyUrn?: string;
  facilityAmount: number;
  facilityType?: string;
  isGefDeal: boolean;
  productTypeCode: ApimGiftProductTypeCode;
  ukefFacilityId: string;
};

/**
 * Map the facility "overview".
 * @param {MapOverviewParams} params - Data required to build the APIM GIFT "facility overview" data.
 * @param {string} params.bankInternalRefName - The bank internal reference name for the facility's deal.
 * @param {number | null} params.coverPercentage - The facility cover percentage to use for calculating the APIM GIFT facility amount.
 * @param {Currency} params.currency - The facility currency code.
 * @param {string} params.effectiveDate - The facility guarantee commencement/effective date.
 * @param {string} params.expiryDate - The facility guarantee expiry date.
 * @param {string} [params.exporterPartyUrn] - The exporter/obligor party URN.  This is from the deal data and is not facility specific, but is required for the "overview" section of the payload.
 * @param {number} params.facilityAmount - The total facility amount.
 * @param {string} [params.facilityType] - The facility type (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {ApimGiftProductTypeCode} params.productTypeCode - The APIM GIFT product type code for the facility.
 * @param {string} params.ukefFacilityId - The UKEF facility identifier.
 * @returns {ApimGiftFacilityOverview} The mapped facility overview data.
 */
export const mapOverview = ({
  bankInternalRefName,
  coverPercentage,
  currency,
  effectiveDate,
  expiryDate,
  exporterPartyUrn,
  facilityAmount,
  facilityType,
  isGefDeal,
  productTypeCode,
  ukefFacilityId,
}: MapOverviewParams): ApimGiftFacilityOverview => ({
  amount: mapFacilityAmount({ facilityAmount, coverPercentage }),
  creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE[productTypeCode],
  currency,
  facilityId: ukefFacilityId,
  effectiveDate,
  expiryDate,
  name: mapFacilityName({
    bankInternalRefName,
    facilityType,
    isGefDeal,
    productTypeCode,
  }),
  obligorUrn: exporterPartyUrn ? String(exporterPartyUrn) : null,
  productTypeCode,
  repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
});
