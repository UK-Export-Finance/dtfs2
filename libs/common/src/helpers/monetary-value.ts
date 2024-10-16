/**
 * Formats the value with two decimal places and thousands separators
 * @param monetaryValue the value to format
 * @returns the formatted value
 */
export const getFormattedMonetaryValue = (monetaryValue: number): string => {
  const formatter = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(monetaryValue);
};
