import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';

type GetFeeFrequencyParams = {
  facilitySnapshot: TfmFacilitySnapshot;
  isEwcsFacility: boolean;
};

/**
 * Get the fee frequency for a facility based on whether it is an EWCS facility or not.
 * @param {GetFeeFrequencyParams} params - The parameters for getting the fee frequency, including the facility snapshot and a flag indicating if it is an EWCS facility.
 * @param {TfmFacilitySnapshot} params.facilitySnapshot - The facility snapshot containing fee frequency information.
 * @param {boolean} params.isEwcsFacility - Flag indicating if the facility is an EWCS facility.
 * @returns {string} The fee frequency as a string, either the premium frequency for EWCS facilities or the fee frequency for BSS facilities.
 */
export const getFeeFrequency = ({ facilitySnapshot, isEwcsFacility }: GetFeeFrequencyParams): string => {
  if (isEwcsFacility) {
    return facilitySnapshot.premiumFrequency ?? '';
  }

  return facilitySnapshot.feeFrequency ?? '';
};
