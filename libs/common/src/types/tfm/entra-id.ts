import { z } from 'zod';
import {
  DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA,
  ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA,
  ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA,
} from '../../schemas/tfm/entra-id.schema';

export type DecodedAuthCodeRequestState = z.infer<typeof DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA>;

export type EntraIdAuthCodeRedirectResponseBody = z.infer<typeof ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA>;

export type EntraIdAuthenticationResult = z.infer<typeof ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA>;
