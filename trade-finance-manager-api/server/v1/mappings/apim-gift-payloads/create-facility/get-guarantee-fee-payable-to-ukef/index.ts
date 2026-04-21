import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';
import mapGuaranteeFeePayableToUkef from '../../../../rest-mappings/mappings/facilities/mapGuaranteeFeePayableToUkef';

type GetGuaranteeFeePayableToUkefParams = {
  facilitySnapshot: TfmFacilitySnapshot;
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
};

/**
 * Get the "guarantee fee payable to UKEF" value for the APIM GIFT payload, based on the deal type.
 * - For BSS/EWCS deals, this is mapped from "guarantee fee payable by bank" value in the facility snapshot.
 * - For GEF deals, this is mapped from "guarantee fee" value in the facility snapshot.
 * @param {params} GetGuaranteeFeePayableToUkefParams - The parameters required to determine the "guarantee fee payable to UKEF" value, including:
 * @param {TfmFacilitySnapshot} params.facilitySnapshot - The TFM facility snapshot containing the relevant fee values.
 * @param {boolean} params.isBssEwcsDeal - Flag indicating if the deal is a BSS/EWCS deal.
 * @param {boolean} params.isGefDeal - Flag indicating if the deal is a GEF deal.
 * @returns {string | null} The "guarantee fee payable to UKEF" value for the APIM GIFT payload.
 */
export const getGuaranteeFeePayableToUkef = ({ facilitySnapshot, isBssEwcsDeal, isGefDeal }: GetGuaranteeFeePayableToUkefParams) => {
  if (isBssEwcsDeal) {
    return mapGuaranteeFeePayableToUkef(facilitySnapshot.guaranteeFeePayableByBank);
  }

  if (isGefDeal) {
    return mapGuaranteeFeePayableToUkef(facilitySnapshot.guaranteeFee);
  }

  return null;
};
