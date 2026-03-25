import { FacilityCategory } from '../../../../../api-response-types';
import { PRODUCT_TYPE_CODES } from '../../../constants';

type MapFacilityCategoryCodeParams = {
  facilityCategoryCode?: string;
  facilityCategories: FacilityCategory[];
  isGefDeal: boolean;
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
