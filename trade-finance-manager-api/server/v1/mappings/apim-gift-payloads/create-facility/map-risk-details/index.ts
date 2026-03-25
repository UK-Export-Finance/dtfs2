import { APIM_GIFT_INTEGRATION } from '../../constants';
import api from '../../../../api';
import { mapFacilityCategoryCode } from './map-facility-category-code';
import { mapFacilityCreditRating } from './map-facility-credit-rating';
import { ApimGiftFacilityRiskDetails, ApimGiftProductTypeCode } from '../../types';
import { FacilityCategory, UkefIndustryCode } from '../../../../api-response-types';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

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
