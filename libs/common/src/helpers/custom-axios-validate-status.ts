/**
 * Validates the status code against the accepted status codes.
 * @param status - The status code to validate.
 * @param accepted - An array of accepted status codes.
 * @returns A boolean indicating whether the status code is accepted or not.
 */
export const customValidateStatus = (status: number, accepted: Array<number>): boolean => accepted.includes(status);
