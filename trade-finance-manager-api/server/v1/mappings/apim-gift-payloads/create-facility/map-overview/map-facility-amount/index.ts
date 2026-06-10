type MapFacilityAmountParams = {
  facilityAmount: number;
  coverPercentage: number;
};

/**
 * Map the facility amount based on the facility amount and cover percentage.
 * @param {MapFacilityAmountParams} params - The parameters for mapping the facility amount.
 * @param {number} params.facilityAmount - The total facility amount.
 * @param {number} params.coverPercentage - The cover percentage for the facility.
 * @returns {number} The mapped facility amount.
 */
export const mapFacilityAmount = ({ facilityAmount, coverPercentage }: MapFacilityAmountParams): number => facilityAmount * (coverPercentage / 100);
