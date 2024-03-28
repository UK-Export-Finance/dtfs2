import { HttpStatusCode } from 'axios';
import { EstoreErrorResponse } from '../../interfaces';
const status = HttpStatusCode.InternalServerError;

/**
 * Generates an internal server error response object for the eStore API.
 *
 * @param {string} message - The error message to include in the response.
 * @returns {object} - The internal server error response object.
 */
export const estoreInternalServerError = (message: string | object): EstoreErrorResponse => ({
  status,
  data: {
    status,
    message,
  },
});
