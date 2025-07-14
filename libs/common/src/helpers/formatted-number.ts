/**
 * formats a number to a string with specified minimum and maximum fraction digits.
 * If the number is not valid, it returns the number as is.
 * @param number - the number to format
 * @param minimumFractionDigits - the minimum number of fraction digits to display, default is 2
 * @param maximumFractionDigits - the maximum number of fraction digits to display, default is 2
 * @returns the formatted number as a string or the original number if it is not valid
 */
export const formattedNumber = (number: number, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
  if (!Number(number)) {
    return number;
  }

  const formatted = Number(number).toLocaleString('en-GB', {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatted;
};
