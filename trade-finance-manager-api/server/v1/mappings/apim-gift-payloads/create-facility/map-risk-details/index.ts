import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES, TFM_CREDIT_RATING_MAP } from '../../constants';
import api from '../../../../api';
import { ApimGiftFacilityRiskDetails } from '../../types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapRiskDetailsParams = {
  creditRiskRatings: string[];
  dealId: string | null;
  exporterCreditRating: string;
  facilityCategoryCode?: string;
  industryCode: string;
  productTypeCode: (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES];
};

type IndustryCodeResponse = {
  ukefIndustryCode: string;
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
 * Map the facility credit rating based on the provided credit risk ratings from APIM MDM and TFM's exporter credit rating.
 * @param {string[]} creditRiskRatings - The list of credit risk ratings from APIM MDM.
 * @param {string} exporterCreditRating - TFM's exporter's credit rating.
 * @returns {string | null} The mapped facility credit rating or null if not found.
 */
export const mapFacilityCreditRating = (creditRiskRatings: string[], exporterCreditRating: string): string | null => {
  const creditRating = exporterCreditRating.trim();

  if (creditRating in TFM_CREDIT_RATING_MAP) {
    return TFM_CREDIT_RATING_MAP[creditRating as keyof typeof TFM_CREDIT_RATING_MAP];
  }

  if (creditRiskRatings.includes(creditRating)) {
    return creditRating;
  }

  return null;
};

/**
 * Map the facility "risk details"
 * @param {MapRiskDetailsParams} params - Data required to build the APIM GIFT "facility risk details" data.
 * @param {string[]} params.creditRiskRatings - The list of credit risk ratings. Required to map the facility credit rating to the APIM expected value.
 * @param {string | null} params.dealId - The TFM deal ID.
 * @param {string} params.exporterCreditRating - TFM's exporter's credit rating.
 * @param {string} [params.facilityCategoryCode] - Optional facility category code (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {(typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]} params.productTypeCode - The APIM GIFT product type code for the facility.
 * @returns {ApimGiftFacilityRiskDetails} The mapped risk details for the APIM GIFT payload.
 */
export const mapRiskDetails = async ({
  creditRiskRatings,
  dealId,
  exporterCreditRating,
  facilityCategoryCode,
  industryCode,
  productTypeCode,
}: MapRiskDetailsParams): Promise<ApimGiftFacilityRiskDetails> => {
  /**
   * Get a UKEF industry code by Companies House industry code.
   *
   * NOTE: if this API call fails, we do NOT want to throw an error.
   * Instead, continue with a null UKEF industry code, which will result in the facility risk details being sent to APIM, but not created in GIFT.
   * If this fails, the UKEF industry code will simply not be sent to GIFT, which is preferable to the entire facility creation failing.
   * Ultimately, this will trigger an alert in APIM for the failed API call, which can be investigated by the team.
   * The alternative of this would be to have retry logic in DTFS, which is not desired - this is APIM's responsibility.
   *
   * Lastly - Unfortunately, because the "api" module is in JS, we lose type information and eslint-disable-next-line has to be used.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const industryCodeResponse = (await api.getUkefIndustryCodeByCompaniesHouseIndustryCode(industryCode)) as IndustryCodeResponse;

  const mapped = {
    account: DEFAULTS.RISK_DETAILS.ACCOUNT,
    dealId,
    facilityCategoryCode: mapFacilityCategoryCode(productTypeCode, facilityCategoryCode),
    facilityCreditRating: mapFacilityCreditRating(creditRiskRatings, exporterCreditRating),
    riskStatus: DEFAULTS.RISK_DETAILS.RISK_STATUS,
    ukefIndustryCode: industryCodeResponse?.ukefIndustryCode || '',
  };

  return mapped;
};
