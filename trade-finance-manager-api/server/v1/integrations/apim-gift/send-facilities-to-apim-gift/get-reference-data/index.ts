import apiModule from '../../../../api';
import { mapApimCreditRiskRatings } from '../../../../mappings/map-apim-credit-risk-ratings';
import type { CreditRiskRating, FacilityCategory } from '../../../../api-response-types';
import { ApiTypes } from '../../../../mappings/apim-gift-payloads/types';

type GetReferenceDataResult = {
  creditRiskRatings: string[];
  facilityCategories: FacilityCategory[];
};

/**
 * Get reference data from APIM MDD.
 * This is required to map APIM GIFT payloads, including:
 * - "Credit risk ratings"
 * - "Facility categories" (only for GEF deals, not required for BSS/EWCS deals)
 * @param {boolean} isGefDeal - A boolean indicating whether the deal is a GEF deal
 * @returns {Promise<GetReferenceDataResult>} Reference data
 *
 * NOTE: if the API call to get reference data from APIM MDM fails, we do NOT want to throw an error.
 * Instead, continue with an empty array of credit risk ratings and facility categories, which could result in the facility credit rating and category not being mapped.
 * But at least the facility can still be created in GIFT and the issue can be investigated separately.
 * If the credit risk rating or facility category mapping fails, the facility credit rating and category will simply not be sent to GIFT, which is preferable to the entire facility creation failing.
 * Ultimately, this will trigger an alert in APIM for the failed API call, which can be investigated by the team.
 * The alternative of this would be to have retry logic in DTFS, but given the low likelihood of the API call failing and the fact that the credit risk rating and facility category mapping can be "best effort", this is not necessary.
 * Note that this is an edge case scenario as 99% of credit risk ratings are in TFM_CREDIT_RATING_MAP and do not require the API call to map the facility credit rating, and most facility categories are in TFM_FACILITY_CATEGORY_MAP and do not require the API call to map the facility category.
 */
export const getReferenceData = async (isGefDeal: boolean): Promise<GetReferenceDataResult> => {
  const api = apiModule as ApiTypes;

  let creditRiskRatingsResponse: CreditRiskRating[] = [];

  try {
    const response = await api.getCreditRiskRatings();

    creditRiskRatingsResponse = Array.isArray(response) ? response : [];
  } catch {
    // Swallow errors and default creditRiskRatingsResponse to an empty array
    creditRiskRatingsResponse = [];
  }

  let facilityCategoriesResponse: FacilityCategory[] = [];

  if (isGefDeal) {
    try {
      const response = await api.getFacilityCategories();

      facilityCategoriesResponse = Array.isArray(response) ? response : [];
    } catch {
      // Swallow errors and default facilityCategoriesResponse to an empty array
      facilityCategoriesResponse = [];
    }
  }

  const creditRiskRatings = mapApimCreditRiskRatings(creditRiskRatingsResponse);

  return {
    creditRiskRatings,
    facilityCategories: facilityCategoriesResponse,
  };
};
