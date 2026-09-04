import apiModule from '../../../../api';
import type { FacilityCategory } from '../../../../api-response-types';
import { ApiTypes } from '../../../../mappings/apim-gift-payloads/types';

type GetReferenceDataResult = {
  facilityCategories: FacilityCategory[];
};

/**
 * Get reference data from APIM MDD.
 * This is required to map APIM GIFT payloads, including:
 * - "Facility categories" (only for GEF deals, not required for BSS/EWCS deals)
 * @param {boolean} isGefDeal - A boolean indicating whether the deal is a GEF deal
 * @returns {Promise<GetReferenceDataResult>} Reference data
 *
 * NOTE: if the API call to get reference data from APIM MDM fails, we do NOT want to throw an error.
 * Instead, continue with an empty array of facility categories, which could result in the category not being mapped.
 * But at least the facility can still be created in GIFT and the issue can be investigated separately.
 * If the facility category mapping fails, the category will simply not be sent to GIFT, which is preferable to the entire facility creation failing.
 * Ultimately, this will trigger an alert in APIM for the failed API call, which can be investigated by the team.
 * The alternative of this would be to have retry logic in DTFS, but given the low likelihood of the API call failing and the fact that the facility category mapping can be "best effort", this is not necessary.
 * Note that this is an edge case scenario as most facility categories are in TFM_FACILITY_CATEGORY_MAP and do not require the API call to map the facility category.
 */
export const getReferenceData = async (isGefDeal: boolean): Promise<GetReferenceDataResult> => {
  const api = apiModule as ApiTypes;

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

  return {
    facilityCategories: facilityCategoriesResponse,
  };
};
