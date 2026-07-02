type MapFacilityAmountParams = {
  facilityAmount: number | string;
  coverPercentage: number | null;
};

/**
 * Map the facility amount based on the facility amount and cover percentage.
 * GEF "value" field is a number.
 * BSS/EWCS "value" field is a string with commas.
 *
 * If the cover percentage is a positive number, the facility amount is calculated as:
 * (facility amount) * (cover percentage / 100)
 * The result is rounded to 2 decimal places.
 * If the cover percentage is not provided (or is 0), the function returns null.
 *
 * cover percentages are stored as percent values (e.g. 80),
 * so this should divide by 100 to avoid sending amounts inflated by 100x.
 * @param {MapFacilityAmountParams} params - The parameters for mapping the facility amount.
 * @param {number | string} params.facilityAmount - The total facility amount.
 * @param {number | null} params.coverPercentage - The cover percentage for the facility.
 * @returns {number | null} The mapped facility amount.
 */
export const mapFacilityAmount = ({ facilityAmount, coverPercentage }: MapFacilityAmountParams): number | null => {
  if (coverPercentage) {
    const facilityAmountNumber = Number(String(facilityAmount).replace(/,/g, ''));

    const amount = Math.round(facilityAmountNumber * (coverPercentage / 100) * 100) / 100;

    return amount;
  }

  return null;
};
