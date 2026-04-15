export const mapSpreadRate = (guaranteeFeePayableToUkef?: string): number | null => {
  if (guaranteeFeePayableToUkef) {
    // Remove percentage sign if present, as GIFT expects a numeric value
    return Number(guaranteeFeePayableToUkef.replace('%', ''));
  }

  return null;
};
