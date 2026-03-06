import { APIM_GIFT_INTEGRATION } from '../../constants';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

/**
 * Map the facility category code based on product type code and facility category code.
 * For GEF, map the facility category code.
 * Any other product does not require the facility category code in the payload.
 * @param {string} productTypeCode - The facility/product type code (e.g. "BSS", "GEF", "EWCS").
 * @param {string} [facilityCategoryCode] - Optional facility category code (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @returns {string | null}
 */
const mapFacilityCategoryCode = (productTypeCode: string, facilityCategoryCode?: string): string | null =>
  productTypeCode === 'GEF' ? String(facilityCategoryCode) : null;

type MapRiskDetailsParams = {
  dealId: string;
  facilityCategoryCode?: string;
  productTypeCode: string;
};

/**
 * Map the facility "risk details"
 * @param {MapRiskDetailsParams} params - Data required to build the APIM GIFT "facility risk details" data.
 * @param {string} params.dealId - The TFM deal ID.
 * @param {string} [params.facilityCategoryCode] - Optional facility category code (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {string} params.productTypeCode - The facility/product type code (e.g. "BSS", "GEF", "EWCS").
 * @returns {object} The mapped risk details.
 */
export const mapRiskDetails = ({ dealId, facilityCategoryCode, productTypeCode }: MapRiskDetailsParams) => {
  const mapped = {
    account: DEFAULTS.RISK_DETAILS.ACCOUNT,
    dealId,
    facilityCategoryCode: mapFacilityCategoryCode(productTypeCode, facilityCategoryCode),
    facilityCreditRating: '', // TODO
    riskStatus: DEFAULTS.RISK_DETAILS.RISK_STATUS,
    ukefIndustryCode: '', // TODO
  };

  return mapped;
};
