import { HttpStatusCode } from 'axios';
import { EstoreErrorResponse } from '../../interfaces';

const status = HttpStatusCode.InternalServerError;

/**
 * Generates an internal server error response object for the eStore API.
 *
 * @param {string} message - The error message to include in the response, this can
 * be either of type `string` or an `object`.
 * @returns {Object} - The internal server error response object.
 */
export const estoreInternalServerError = (message: unknown): EstoreErrorResponse => ({
  status,
  data: {
    status,
    message,
  },
});
