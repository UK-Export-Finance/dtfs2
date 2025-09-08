import { CountryInterface, CurrencyInterface, IndustrySectorInterface } from '@ukef/dtfs2-common';

type UnionCountryCurrencyIndustryInterface = CountryInterface | CurrencyInterface | IndustrySectorInterface;

/**
 * Sorts an array of `UnionCountryCurrencyIndustryInterface` objects alphabetically by a specified string field.
 *
 * @param arr - The array of objects to sort.
 * @param field - The key of the field to sort by. The field should have a string value.
 * @returns The sorted array, ordered alphabetically by the specified field.
 */
export const sortArrayAlphabetically = (arr: UnionCountryCurrencyIndustryInterface[], field: string): UnionCountryCurrencyIndustryInterface[] =>
  arr.sort((a, b) =>
    (a[field as keyof UnionCountryCurrencyIndustryInterface] as string).localeCompare(b[field as keyof UnionCountryCurrencyIndustryInterface] as string),
  );
