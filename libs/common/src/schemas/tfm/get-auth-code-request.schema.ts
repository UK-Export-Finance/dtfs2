import { z } from 'zod';

/**
 *Schema for the request body sent from TFM UI to TFM API when requesting an auth code.
 * Currently similar to GET_AUTH_CODE_PARAMS_SCHEMA.
 * This is used to differentiate between the request body leaving TFM UI to TFM API,
 * and the parameters that get passed around functions internal to the respective services
 */

export const GET_AUTH_CODE_REQUEST_SCHEMA = z.object({
  successRedirect: z.string(),
});
