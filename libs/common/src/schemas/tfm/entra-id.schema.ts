import { z } from 'zod';
import { ENTRA_ID_USER_SCHEMA } from './entra-id-user.schema';

export const DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA = z.object({
  csrfToken: z.string(),
  successRedirect: z.string().optional(),
});

export const ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA = z.object({
  code: z.string(),
  client_info: z.string().optional(),
  state: z.string(),
  session_state: z.string().optional(),
});

// Note: there are many more fields in the authentication result, but these are
// the only ones we care about
// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/src/response/AuthenticationResult.ts
export const ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA = z.object({
  accessToken: z.string(),
  account: z.object({
    idTokenClaims: ENTRA_ID_USER_SCHEMA,
  }),
});

/**
 * Zod schema for validating an email address using Entra ID requirements.
 * Ensures the value is a valid email string.
 *
 * @see https://zod.dev/?id=string-email
 */
export const ENTRA_ID_EMAIL_SCHEMA = z.string().email();
