import { PRODUCT_TYPE_CODES_TO_DEAL_TYPE } from '../../../constants';
import { ApimGiftProductTypeCode } from '../../../types';

type MapFacilityNameParams = {
  facilityType?: string;
  isGefDeal: boolean;
  monthsOfCover?: number | null;
  productTypeCode: ApimGiftProductTypeCode;
};

/**
 * Map the facility name based on the product type code, facility type and months of cover.
 * Examples:
 * - GEF => "GEF Contingent: 6 months"
 * - BSS => "BSS: 12 months"
 * @param {MapFacilityNameParams} params - Data required to build the APIM GIFT "facility name" string.
 * @param {string} [params.facilityType] - The facility type (e.g. "Bond", "Cash", "Contingent", "Loan"). Only required for GEF facilities.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @param {number | null} [params.monthsOfCover] - The length of cover in months.
 * @param {ApimGiftProductTypeCode} params.productTypeCode - The product type code.
 * @returns {string | null} The mapped facility name.
 */
export const mapFacilityName = ({ facilityType, isGefDeal, monthsOfCover, productTypeCode }: MapFacilityNameParams): string | null => {
  if (monthsOfCover === null || monthsOfCover === undefined) {
    return null;
  }

  const productName = PRODUCT_TYPE_CODES_TO_DEAL_TYPE[productTypeCode];

  if (isGefDeal && facilityType) {
    return `${productName} ${facilityType}: ${monthsOfCover} months`;
  }

  return `${productName}: ${monthsOfCover} months`;
};
