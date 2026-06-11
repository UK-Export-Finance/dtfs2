type MapFacilityAmountParams = {
  facilityAmount: number;
  coverPercentage: number | null;
};

/**
 * Map the facility amount based on the facility amount and cover percentage.
 * @param {MapFacilityAmountParams} params - The parameters for mapping the facility amount.
 * @param {number} params.facilityAmount - The total facility amount.
 * @param {number | null} params.coverPercentage - The cover percentage for the facility.
 * @returns {number | null} The mapped facility amount.
 */
export const mapFacilityAmount = ({ facilityAmount, coverPercentage }: MapFacilityAmountParams): number | null => {
  if (coverPercentage) {
    return facilityAmount * coverPercentage;
  }

  return null;
};
