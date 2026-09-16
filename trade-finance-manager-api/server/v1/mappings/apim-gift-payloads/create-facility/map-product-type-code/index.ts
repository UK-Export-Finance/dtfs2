import { PRODUCT_TYPE_CODES } from '../../constants';
import { ApimGiftProductTypeCode } from '../../types';

type MapProductTypeCodeParams = {
  isBssFacility: boolean;
  isCashFacility: boolean;
  isContingentFacility: boolean;
  isEwcsFacility: boolean;
};

/**
 * Depending on the facility type (e.g. BSS, EWCS, Cash, Contingent), return the correct APIM GIFT product type code for the facility.
 * Examples:
 * BSS/EWCS (Bond/Loan) facilities => GIFT product type code "BSS"
 * GEF facility (Cash/Contingent) facilities => GIFT product type code "GEF"
 * NOTE: V1 integration only supports BSS Bond facilities and GEF facilities.
 * @param {MapProductTypeCodeParams} params - Object containing flags indicating the deal
 * @param {boolean} params.isBssFacility - If the facility is a BSS (Bond) facility.
 * @param {boolean} params.isCashFacility - If the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - If the facility is a Contingent facility.
 * @param {boolean} params.isEwcsFacility - If the facility is an EWCS (Loan) facility.
 * @returns {ApimGiftProductTypeCode} The APIM/GIFT product type code for the facility.
 */
export const mapProductTypeCode = ({
  isBssFacility,
  isCashFacility,
  isContingentFacility,
  isEwcsFacility,
}: MapProductTypeCodeParams): ApimGiftProductTypeCode => {
  if (isBssFacility) {
    return PRODUCT_TYPE_CODES.BSS;
  }

  if (isCashFacility || isContingentFacility) {
    return PRODUCT_TYPE_CODES.GEF;
  }

  if (isEwcsFacility) {
    return PRODUCT_TYPE_CODES.EWCS;
  }

  /**
   * If the "Unknown" product type code is sent to APIM/GIFT, this will trigger an alert in APIM for the unexpected product type code value, which can be investigated by the team.
   * This is an extreme edge case that will probably never occur in practice, as the facility type is expected to always be recognized.
   * This is included as a safeguard to ensure that the integration can handle unexpected deal types without breaking.
   * If the facility type is not recognized, it may indicate an issue with the facility data that should be investigated, so sending an "Unknown" product type code allows the issue to be identified and addressed without causing errors in the integration.
   */
  return PRODUCT_TYPE_CODES.UNKNOWN;
};
