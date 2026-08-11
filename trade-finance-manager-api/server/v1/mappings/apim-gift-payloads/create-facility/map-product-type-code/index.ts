import { PRODUCT_TYPE_CODES } from '../../constants';
import { ApimGiftProductTypeCode } from '../../types';

type MapProductTypeCodeParams = {
  isBssFacility: boolean;
  isGefDeal: boolean;
};

/**
 * Depending on the deal type (e.g. BSS/EWCS or GEF), return the correct APIM GIFT product type code for the facility.
 * Examples:
 * BSS/EWCS deal type "BSS/EWCS" => GIFT product type code "BSS"
 * GEF deal type "GEF" => GIFT product type code "GEF"
 * NOTE: V1 integration only supports BSS Bond facilities and GEF facilities.
 * @param {MapProductTypeCodeParams} params - Object containing flags indicating the deal
 * @param {boolean} params.isBssFacility - The facility category code (e.g. "Bond", "Cash", "Contingent", "Loan").
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @returns {ApimGiftProductTypeCode} The APIM/GIFT product type code for the facility.
 */
export const mapProductTypeCode = ({ isBssFacility, isGefDeal }: MapProductTypeCodeParams): ApimGiftProductTypeCode => {
  if (isBssFacility) {
    return PRODUCT_TYPE_CODES.BSS;
  }

  if (isGefDeal) {
    return PRODUCT_TYPE_CODES.GEF;
  }

  /**
   * If the "Unknown" product type code is sent to APIM/GIFT, this will trigger an alert in APIM for the unexpected product type code value, which can be investigated by the team.
   * This is an extreme edge case that will probably never occur in practice, as the deal type is expected to always be recognized for valid deals.
   * This is included as a safeguard to ensure that the integration can handle unexpected deal types without breaking.
   * If the deal type is not recognized, it may indicate an issue with the deal data that should be investigated, so sending an "Unknown" product type code allows the issue to be identified and addressed without causing errors in the integration.
   */
  return PRODUCT_TYPE_CODES.UNKNOWN;
};
