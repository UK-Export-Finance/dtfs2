import { CountryInterface, CurrencyInterface, IndustrySectorInterface } from '@ukef/dtfs2-common';

type unionInterface = CountryInterface | CurrencyInterface | IndustrySectorInterface;

/**
 * Sorts an array of objects alphabetically based on a specified field.
 *
 * @param {unionInterface[]} arr - The array of objects to be sorted.
 * @param {string} field - The field name by which to sort the objects.
 * @returns {unionInterface[]} The sorted array of objects.
 */
export const sortArrayAlphabetically = (arr: unionInterface[], field: string): unionInterface[] =>
  arr.sort((a: unionInterface, b: unionInterface) => (a[field as keyof unionInterface] as string).localeCompare(b[field as keyof unionInterface] as string));
