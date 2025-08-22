/**
 * Defines the interfaces for the error response of the number generator.
 *
 * @interface NumberGeneratorErrorResponse
 * @property {number} status - The status code of the error response.
 * @property {object} error - The error object containing details about the error.
 */
export interface NumberGeneratorErrorResponse {
  readonly status: number;
  readonly error: object;
}
