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

// TODO: Unit tests
/**
 * Converts a monetary value string with commas to a number
 * @param monetaryValue the string value to convert (e.g. "1,234.56")
 * @returns the numeric value without commas (e.g. 1234.56)
 */
export const getMonetaryValueAsNumber = (monetaryValue: string) => Number(monetaryValue.replaceAll(',', ''));
