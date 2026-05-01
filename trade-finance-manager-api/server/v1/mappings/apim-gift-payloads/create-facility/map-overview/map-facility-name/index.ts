import { APIM_GIFT_INTEGRATION, PRODUCT_TYPE_CODES_TO_DEAL_TYPE } from '../../../constants';
import { ApimGiftProductTypeCode } from '../../../types';

const { CONSUMER } = APIM_GIFT_INTEGRATION;

type MapFacilityNameParams = {
  bankInternalRefName: string;
  facilityType?: string;
  isGefDeal: boolean;
  productTypeCode: ApimGiftProductTypeCode;
};

/**
 * Map the facility name based on the product type code, facility type and bank internal reference name.
 * Examples:
 * - GEF => "DTFS Cash GEF: Nighthawk facility 1"
 * - BSS => "DTFS BSS: Nighthawk facility 1"
 * @param {MapFacilityNameParams} params - Data required to build the APIM GIFT "facility name" string.
 * @param {string} params.bankInternalRefName - The bank internal reference name.
 * @param {string} [params.facilityType] - The facility type (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {ApimGiftProductTypeCode} params.productTypeCode - The product type code.
 * @returns {string} The mapped facility name.
 */
export const mapFacilityName = ({ bankInternalRefName, facilityType, isGefDeal, productTypeCode }: MapFacilityNameParams): string => {
  const productName = PRODUCT_TYPE_CODES_TO_DEAL_TYPE[productTypeCode as keyof typeof PRODUCT_TYPE_CODES_TO_DEAL_TYPE];

  if (isGefDeal) {
    if (facilityType) {
      return `${CONSUMER} ${facilityType} ${productName}: ${bankInternalRefName}`;
    }

    return `${CONSUMER} ${productName}: ${bankInternalRefName}`;
  }

  return `${CONSUMER} ${productName}: ${bankInternalRefName}`;
};
