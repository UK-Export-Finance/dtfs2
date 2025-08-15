import { UnionCountryCurrencyIndustryInterface } from '@ukef/dtfs2-common';

/**
 * Sorts an array of objects alphabetically based on a specified field.
 *
 * @param {unionInterface[]} arr - The array of objects to be sorted.
 * @param {string} field - The field name by which to sort the objects.
 * @returns {unionInterface[]} The sorted array of objects.
 */
export const sortArrayAlphabetically = (arr: UnionCountryCurrencyIndustryInterface[], field: string): UnionCountryCurrencyIndustryInterface[] =>
  arr.sort((a: UnionCountryCurrencyIndustryInterface, b: UnionCountryCurrencyIndustryInterface) =>
    (a[field as keyof UnionCountryCurrencyIndustryInterface] as string).localeCompare(b[field as keyof UnionCountryCurrencyIndustryInterface] as string),
  );
