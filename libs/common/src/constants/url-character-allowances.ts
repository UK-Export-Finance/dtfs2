/**
 * Maximum recommended URL length for security and performance reasons.
 * @see {@link https://stackoverflow.com/a/48230425}
 */
export const MAX_URL_CHARACTERS = 2048;

/**
 * Estimated character allowance for the base URL (without query parameters).
 */
export const BASE_URL_CHARACTER_ALLOWANCE = 150;

/**
 * Maximum length for URL with query parameters.
 */
export const URL_WITH_PARAMS_MAX_LENGTH = MAX_URL_CHARACTERS - BASE_URL_CHARACTER_ALLOWANCE;
