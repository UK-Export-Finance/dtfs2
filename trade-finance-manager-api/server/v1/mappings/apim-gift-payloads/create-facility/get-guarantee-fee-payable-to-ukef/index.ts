import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';
import mapGuaranteeFeePayableToUkef from '../../../../rest-mappings/mappings/facilities/mapGuaranteeFeePayableToUkef';

type GetGuaranteeFeePayableToUkefParams = {
  facilitySnapshot: TfmFacilitySnapshot;
  isBssFacility: boolean;
  isEwcsFacility: boolean;
  isCashFacility: boolean;
  isContingentFacility: boolean;
};

/**
 * Get the "guarantee fee payable to UKEF" value for the APIM GIFT payload, based on the facility type.
 * - For BSS/EWCS facilities, this is mapped from the "guarantee fee payable by bank" value in the facility snapshot.
 * - For Cash/Contingent facilities, this is mapped from the "guarantee fee" value in the facility snapshot.
 * @param {GetGuaranteeFeePayableToUkefParams} params - The parameters required to determine the "guarantee fee payable to UKEF" value, including:
 * @param {TfmFacilitySnapshot} params.facilitySnapshot - The TFM facility snapshot containing the relevant fee values.
 * @param {boolean} params.isBssFacility - If the facility is a BSS facility.
 * @param {boolean} params.isCashFacility - If the facility is a Cash facility.
 * @param {boolean} params.isContingentFacility - If the facility is a Contingent facility.
 * @param {boolean} params.isEwcsFacility - If the facility is an EWCS facility.
 * @returns {string | null} The "guarantee fee payable to UKEF" value for the APIM GIFT payload.
 */
export const getGuaranteeFeePayableToUkef = ({
  facilitySnapshot,
  isBssFacility,
  isCashFacility,
  isContingentFacility,
  isEwcsFacility,
}: GetGuaranteeFeePayableToUkefParams) => {
  if ((isBssFacility || isEwcsFacility) && facilitySnapshot.guaranteeFeePayableByBank) {
    return mapGuaranteeFeePayableToUkef(facilitySnapshot.guaranteeFeePayableByBank);
  }

  if ((isCashFacility || isContingentFacility) && facilitySnapshot.guaranteeFee) {
    return mapGuaranteeFeePayableToUkef(facilitySnapshot.guaranteeFee);
  }

  return null;
};
