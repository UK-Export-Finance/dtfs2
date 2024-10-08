/**
 * Validates the status code of an HTTP response.
 * Returns true if the status code is between 200 and 499 (inclusive), false otherwise.
 *
 * @param status - The status code of the HTTP response.
 * @returns A boolean indicating whether the status code is valid.
 */
export const customValidateStatus = (status: number): boolean => status >= 200 && status < 500;
