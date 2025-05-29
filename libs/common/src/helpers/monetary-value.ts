/**
 * Formats the value with two decimal places and thousands separators
 * @param monetaryValue the value to format
 * @returns the formatted value
 */
export const getFormattedMonetaryValue = (monetaryValue: number, decimals = true): string => {
  /**
   * if decimals is true,
   * format the value with two decimal places and thousands separators
   * eg. 1234567.89 -> 1,234,567.89
   * if decimals is false,
   * format the value without decimal places and with thousands separator
   * eg. 1234567 -> 1,234,567
   */
  const formatter = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });
  return formatter.format(monetaryValue);
};

/**
 * Converts a monetary value string with commas to a number
 * @param monetaryValue the string value to convert (e.g. "1,234.56")
 * @returns the numeric value without commas (e.g. 1234.56)
 */
export const getMonetaryValueAsNumber = (monetaryValue: string) => Number(monetaryValue.replaceAll(',', ''));
