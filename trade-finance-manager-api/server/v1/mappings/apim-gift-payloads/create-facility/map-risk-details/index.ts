import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../../constants';
import { ApimGiftFacilityRiskDetails } from '../../types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapRiskDetailsParams = {
  dealId: string;
  facilityCategoryCode?: string;
  productTypeCode: (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES];
};

/**
 * Map the facility category code based on product type code and facility category code.
 * For GEF, map the facility category code.
 * Any other product does not require the facility category code in the payload.
 * @param {(typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]} params.productTypeCode - The APIM GIFT product type code for the facility.
 * @param {string} [facilityCategoryCode] - Optional facility category code (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @returns {string | null}
 */
export const mapFacilityCategoryCode = (productTypeCode: (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES], facilityCategoryCode?: string): string | null =>
  productTypeCode === PRODUCT_TYPES.GEF && facilityCategoryCode ? String(facilityCategoryCode) : null;

/**
 * Map the facility "risk details"
 * @param {MapRiskDetailsParams} params - Data required to build the APIM GIFT "facility risk details" data.
 * @param {string} params.dealId - The TFM deal ID.
 * @param {string} [params.facilityCategoryCode] - Optional facility category code (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {(typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]} params.productTypeCode - The APIM GIFT product type code for the facility.
 * @returns {ApimGiftFacilityRiskDetails} The mapped risk details.
 */
export const mapRiskDetails = ({ dealId, facilityCategoryCode, productTypeCode }: MapRiskDetailsParams): ApimGiftFacilityRiskDetails => {
  const mapped = {
    account: DEFAULTS.RISK_DETAILS.ACCOUNT,
    dealId,
    facilityCategoryCode: mapFacilityCategoryCode(productTypeCode, facilityCategoryCode),
    facilityCreditRating: '', // TODO: DTFS2-8318
    riskStatus: DEFAULTS.RISK_DETAILS.RISK_STATUS,
    ukefIndustryCode: '', // TODO: DTFS2-8319
  };

  return mapped;
};
