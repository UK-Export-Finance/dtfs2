import { DEAL_TYPE } from '@ukef/dtfs2-common';
import type { FacilityCategory } from '../../../../../api-response-types/facility-category';

type MapFacilityCategoryCodeParams = {
  facilityType?: string;
  facilityCategories: FacilityCategory[];
  isGefDeal: boolean;
};

/**
 * For GEF facilities only,
 * map the facility category code by finding a match in the provided facility categories from APIM MDM,
 * where the category description includes both "GEF" and the TFM facility category code.
 * This is required because GEF facility categories are not codes.
 * Any other product/facility does not require a facility category code in the payload.
 * @param {MapFacilityCategoryCodeParams} params - Data required to map the facility category code for GEF facilities.
 * @param {FacilityCategory[]} params.facilityCategories - The list of facility categories from APIM MDM.
 * @param {string} [params.facilityType] - Facility type (e.g. "Cash", "Contingent").
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @returns {string | null}
 * @example
 * ```
 * const facilityCategoryCode = mapFacilityCategoryCode({
 *   facilityType: 'Cash',
 *   facilityCategories: [...],
 *   isGefDeal: true
 * });
 * //=> 'FCT007'
 * ```
 */
export const mapFacilityCategoryCode = ({ facilityType, facilityCategories, isGefDeal }: MapFacilityCategoryCodeParams): string | null => {
  const tfmCategory = facilityType && facilityType !== '' ? String(facilityType) : null;

  if (isGefDeal && tfmCategory) {
    const matchingCategory = facilityCategories.find((category: FacilityCategory) => {
      return category.description.includes(DEAL_TYPE.GEF) && category.description.includes(tfmCategory);
    });

    if (matchingCategory) {
      return matchingCategory.code;
    }
  }

  return null;
};
