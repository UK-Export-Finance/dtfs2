import { DEAL_TYPE } from '@ukef/dtfs2-common';
import type { FacilityCategory } from '../../../../../api-response-types/facility-category';
import { FACILITY_CATEGORY_CODES } from '../../../constants';

type MapFacilityCategoryCodeParams = {
  ewcsSupplierType: string | null;
  facilityType?: string;
  facilityCategories: FacilityCategory[];
  isCashFacility: boolean;
  isContingentFacility: boolean;
  isEwcsFacility: boolean;
};

/**
 * Map the facility category code for an EWCS facility by looking up the supplier type in the FACILITY_CATEGORY_CODES mapping.
 * If the supplier type is not found in the mapping, return the "UNKNOWN" facility category code.
 * @param {string | null} supplierType - The EWCS supplier type for the facility.
 * @returns {string} The mapped facility category code for an EWCS facility, or the "UNKNOWN" facility category code if not found.
 * @example
 * ```
 * const facilityCategoryCode = mapEwcsFacilityCategoryCode('Exporter');
 * //=> 'FCT004'
 * ```
 * @example
 * ```
 * const facilityCategoryCode = mapEwcsFacilityCategoryCode('UK Supplier');
 * //=> 'FCT005'
 * ```
 * @example
 * ```
 * const facilityCategoryCode = mapEwcsFacilityCategoryCode('Unknown Supplier Type');
 * //=> 'UNKNOWN_FACILITY_CATEGORY_CODE'
 * ```
 */
export const mapEwcsFacilityCategoryCode = (supplierType: string | null): string => {
  const canMap = supplierType && Object.prototype.hasOwnProperty.call(FACILITY_CATEGORY_CODES, supplierType);

  if (canMap) {
    const categoryCode = FACILITY_CATEGORY_CODES[supplierType as keyof typeof FACILITY_CATEGORY_CODES];

    return categoryCode;
  }

  return FACILITY_CATEGORY_CODES.UNKNOWN;
};

/**
 * Map the facility category code for a facility by looking up the facility type in the list of facility categories from APIM MDM.
 * If the facility is an EWCS facility, map the facility category code by looking up the supplier type in the FACILITY_CATEGORY_CODES mapping.
 * If the facility is not a Cash, Contingent, or EWCS facility, return null.
 * @param {MapFacilityCategoryCodeParams} params - Data required to map the facility category code for GEF facilities.
 * @param {string | null} params.ewcsSupplierType - The EWCS supplier type for the facility.
 * @param {FacilityCategory[]} params.facilityCategories - The list of facility categories from APIM MDM.
 * @param {string} [params.facilityType] - Facility type (e.g. "Cash", "Contingent").
 * @param {boolean} params.isCashFacility - Flag indicating if the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - Flag indicating if the facility is a Contingent facility.
 * @param {boolean} params.isEwcsFacility - Flag indicating if the facility is an EWCS facility.
 * @returns {string | null}
 * @example
 * ```
 * const facilityCategoryCode = mapFacilityCategoryCode({
 *   facilityType: 'Cash',
 *   facilityCategories: [...],
 *   isCashFacility: true,
 *   isContingentFacility: false
 * });
 * //=> 'FCT007'
 * ```
 */
export const mapFacilityCategoryCode = ({
  ewcsSupplierType,
  facilityType,
  facilityCategories,
  isCashFacility,
  isContingentFacility,
  isEwcsFacility,
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

  if (isEwcsFacility) {
    const categoryCode = mapEwcsFacilityCategoryCode(ewcsSupplierType);

    return categoryCode;
  }

  return null;
};
