/**
 * Map the facility's guarantee fee payable to UKEF to the "spread rate" field in GIFT accrual schedules.
 * If the guarantee fee payable to UKEF is provided, removes any percentage sign and converts it to a number for the spread rate.
 * If the guarantee fee payable to UKEF is not provided, returns null for the spread rate.
 * @param {string | null} guaranteeFeePayableToUkef - The facility's guarantee fee payable to UKEF, as a string (e.g. "1.5%" or "1.5").
 * @returns {number | null} The spread rate for the GIFT accrual schedule, as a number (e.g. 1.5), or null if not provided.
 */
export const mapSpreadRate = (guaranteeFeePayableToUkef: string | null): number | null => {
  if (guaranteeFeePayableToUkef) {
    return Number(guaranteeFeePayableToUkef.replace('%', ''));
  }

  return null;
};
