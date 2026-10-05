import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';

type GetFeeTypeParams = {
  facilitySnapshot: TfmFacilitySnapshot;
  isEwcsFacility: boolean;
};

/**
 * Get the fee type for a facility based on whether it is an EWCS facility or not.
 * @param {GetFeeTypeParams} params - The parameters for getting the fee type, including the facility snapshot and a flag indicating if it is an EWCS facility.
 * @param {TfmFacilitySnapshot} params.facilitySnapshot - The facility snapshot containing fee type information.
 * @param {boolean} params.isEwcsFacility - Flag indicating if the facility is an EWCS facility.
 * @returns {string} The fee type as a string, either the premium type for EWCS facilities or the fee type for non-EWCS facilities (e.g. BSS, GEF).
 */
export const getFeeType = ({ facilitySnapshot, isEwcsFacility }: GetFeeTypeParams): string => {
  if (isEwcsFacility) {
    return facilitySnapshot.premiumType ?? '';
  }

  return facilitySnapshot.feeType ?? '';
};
