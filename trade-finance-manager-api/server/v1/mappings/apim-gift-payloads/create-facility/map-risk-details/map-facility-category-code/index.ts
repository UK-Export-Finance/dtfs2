import { DEAL_TYPE } from '@ukef/dtfs2-common';
import type { FacilityCategory } from '../../../../../api-response-types/facility-category';

type MapFacilityCategoryCodeParams = {
  facilityType?: string;
  facilityCategories: FacilityCategory[];
  isCashFacility: boolean;
  isContingentFacility: boolean;
};

/**
 * For GEF facilities only,
 * map the facility category code by finding a match in the provided facility categories from APIM MDM,
 * where the category description includes both "GEF" and the TFM facility category code.
 * This is required because GEF facility categories are not codes.
 * Any other product/facility does not require a facility category code in the payload.
 * NOTE: BSS/EWCS facilities are expected to have a null facility category code.
 * @param {MapFacilityCategoryCodeParams} params - Data required to map the facility category code for GEF facilities.
 * @param {FacilityCategory[]} params.facilityCategories - The list of facility categories from APIM MDM.
 * @param {string} [params.facilityType] - Facility type (e.g. "Cash", "Contingent").
 * @param {boolean} params.isCashFacility - If the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - If the facility is a Contingent facility.
 * @returns {string | null}
 * @example
 * ```
 * const facilityCategoryCode = mapFacilityCategoryCode({
 *   facilityType: 'Cash',
 *   facilityCategories: [...],
 *   isCashFacility: true
 * });
 * //=> 'FCT007'
 * ```
 */
export const mapFacilityCategoryCode = ({
  facilityType,
  facilityCategories,
  isCashFacility,
  isContingentFacility,
}: MapFacilityCategoryCodeParams): string | null => {
  const tfmCategory = facilityType && facilityType !== '' ? String(facilityType) : null;

  if ((isCashFacility || isContingentFacility) && tfmCategory) {
    const matchingCategory = facilityCategories.find((category: FacilityCategory) => {
      return category.description.includes(DEAL_TYPE.GEF) && category.description.includes(tfmCategory);
    });

    if (matchingCategory) {
      return matchingCategory.code;
    }
  }

  return null;
};
