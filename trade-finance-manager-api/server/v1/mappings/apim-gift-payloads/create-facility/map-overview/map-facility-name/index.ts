import { APIM_GIFT_INTEGRATION } from '../../../constants';
import { ApimGiftProductTypeCode } from '../../../types';

const { CONSUMER } = APIM_GIFT_INTEGRATION;

type MapFacilityNameParams = {
  bankInternalRefName: string;
  facilityCategoryCode: string;
  isGefDeal: boolean;
  productTypeCode: ApimGiftProductTypeCode;
};

/**
 * Map the facility name based on the product type code, facility category code and bank internal reference name.
 * Examples:
 * - GEF => "DTFS Cash GEF: Nighthawk facility 1"
 * - BSS => "DTFS BSS: Nighthawk facility 1"
 * @param {MapFacilityNameParams} params - Data required to build the APIM GIFT "facility name" string.
 * @param {string} params.bankInternalRefName - The bank internal reference name.
 * @param {string} params.facilityCategoryCode - The facility category code.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {ApimGiftProductTypeCode} params.productTypeCode - The product type code.
 * @returns {string} The mapped facility name.
 */
export const mapFacilityName = ({ bankInternalRefName, facilityCategoryCode, isGefDeal, productTypeCode }: MapFacilityNameParams) => {
  if (isGefDeal) {
    return `${CONSUMER} ${facilityCategoryCode} ${productTypeCode}: ${bankInternalRefName}`;
  }

  return `${CONSUMER} ${productTypeCode}: ${bankInternalRefName}`;
};
