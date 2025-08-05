import { GREAT_BRITIAN, GB_ISO3166_CODE } from '../constants/country';

/**
 * Determines if the provided country is considered the UK (Great Britain).
 *
 * @param country - The name of the country to check.
 * @param returnCode - If true, returns the ISO 3166 code for Great Britain ('GB') if the country is UK, otherwise returns an empty string. If false, returns a boolean indicating whether the country is UK.
 * @returns Returns a boolean indicating if the country is UK, or the ISO 3166 code ('GB') if `returnCode` is true and the country is UK.
 */
export const isCountryUk = (country: string, returnCode: boolean = false): boolean | string => {
  const isUk = GREAT_BRITIAN.includes(country.toLowerCase());

  if (returnCode) {
    return isUk ? GB_ISO3166_CODE : '';
  }

  return isUk;
};
