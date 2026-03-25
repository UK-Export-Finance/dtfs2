import { APIM_GIFT_INTEGRATION, PRODUCT_TYPE_CODES, TFM_CREDIT_RATING_MAP } from '../../constants';
import api from '../../../../api';
import { ApimGiftFacilityRiskDetails, ApimGiftProductTypeCode } from '../../types';
import { FacilityCategory, UkefIndustryCode } from '../../../../api-response-types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

type MapFacilityCategoryCodeParams = {
  facilityCategoryCode?: string;
  facilityCategories: FacilityCategory[];
  isGefDeal: boolean;
};

type MapRiskDetailsParams = {
  creditRiskRatings: string[];
  dealId: string | null;
  exporterCreditRating: string;
  facilityCategoryCode?: string;
  facilityCategories: FacilityCategory[];
  industryCode: string;
  isGefDeal: boolean;
  productTypeCode: ApimGiftProductTypeCode;
};

/**
 * For GEF facilities only,
 * map the facility category code by finding a match in the provided facility categories from APIM MDM,
 * where the category description includes both "GEF" and the TFM facility category code.
 * This is required because GEF facility categories are not codes.
 * Any other product/facility does not require a facility category code in the payload.
 * @param {string} [facilityCategoryCode] - Optional facility category code (e.g. "Cash", "Contingent").
 * @param {FacilityCategory[]} facilityCategories - The list of facility categories from APIM MDM.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @returns {string | null}
 * @example
 * ```
 * const facilityCategoryCode = mapFacilityCategoryCode({
 *   facilityCategoryCode: 'Cash',
 *   facilityCategories: [...],
 *   isGefDeal: true
 * });
 * //=> 'FCT007'
 * ```
 */
export const mapFacilityCategoryCode = ({ facilityCategoryCode, facilityCategories, isGefDeal }: MapFacilityCategoryCodeParams): string | null => {
  if (isGefDeal) {
    const matchingCategory = facilityCategories.find((category: FacilityCategory) => {
      const tfmCategory = facilityCategoryCode ?? String(facilityCategoryCode);

      return category.description.includes(PRODUCT_TYPE_CODES.GEF) && category.description.includes(tfmCategory);
    });

    if (matchingCategory) {
      return matchingCategory.code;
    }
  }

  return null;
};

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
 * Map the facility "risk details".
 * @param {MapRiskDetailsParams} params - Data required to build the APIM GIFT "facility risk details" data.
 * @param {string[]} params.creditRiskRatings - The list of credit risk ratings. Required to map the facility credit rating to the APIM expected value.
 * @param {string | null} params.dealId - The TFM deal ID.
 * @param {string} params.exporterCreditRating - TFM's exporter's credit rating.
 * @param {string} [params.facilityCategoryCode] - Optional facility category code (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {string[]} params.facilityCategories - The list of facility categories from APIM MDM. Required to map the facility category code to the APIM expected value.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @returns {ApimGiftFacilityRiskDetails} The mapped risk details for the APIM GIFT payload.
 */
export const mapRiskDetails = async ({
  creditRiskRatings,
  dealId,
  exporterCreditRating,
  facilityCategoryCode,
  facilityCategories,
  industryCode,
  isGefDeal,
}: MapRiskDetailsParams): Promise<ApimGiftFacilityRiskDetails> => {
  /**
   * Get a UKEF industry code by Companies House industry code.
   *
   * NOTE: if this API call fails, we do NOT want to throw an error.
   * Instead, continue with an empty UKEF industry code, which will result in the facility risk details being sent to APIM, but not created in GIFT.
   * If this fails, the UKEF industry code will simply not be sent to GIFT, which is preferable to the entire facility creation failing.
   * Ultimately, this will trigger an alert in APIM for the failed API call, which can be investigated by the team.
   * The alternative of this would be to have retry logic in DTFS, which is not desired - this is APIM's responsibility.
   */
  let industryCodeResponse: UkefIndustryCode;

  try {
    const response = (await api.getUkefIndustryCodeByCompaniesHouseIndustryCode(industryCode)) as UkefIndustryCode | undefined;

    industryCodeResponse = response ?? { ukefIndustryCode: '' };
  } catch {
    // Swallow errors and default ukefIndustryCode to an empty string
    industryCodeResponse = { ukefIndustryCode: '' };
  }

  const mapped: ApimGiftFacilityRiskDetails = {
    account: DEFAULTS.RISK_DETAILS.ACCOUNT,
    dealId,
    facilityCategoryCode: mapFacilityCategoryCode({
      facilityCategoryCode,
      facilityCategories,
      isGefDeal,
    }),
    facilityCreditRating: mapFacilityCreditRating(creditRiskRatings, exporterCreditRating),
    riskStatus: DEFAULTS.RISK_DETAILS.RISK_STATUS,
    ukefIndustryCode: industryCodeResponse.ukefIndustryCode,
  };

  return mapped;
};
