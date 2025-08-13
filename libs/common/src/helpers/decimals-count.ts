/**
 * calculate the number of decimal places in a number
 * returns 0 if no decimal places
 * @param number - provided number
 * @returns decimal count
 */
export const decimalsCount = (number: number) => {
  const decimals = number.toString().split('.')[1];

  return decimals?.length ?? 0;
};
