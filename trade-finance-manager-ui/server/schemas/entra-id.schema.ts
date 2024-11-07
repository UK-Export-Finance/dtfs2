import { z } from 'zod';
import { EntraIdUserSchema } from './entra-id-user.schema';

export const DecodedAuthCodeRequestStateSchema = z.object({
  csrfToken: z.string(),
  successRedirect: z.string().optional(),
});

export const EntraIdAuthCodeRedirectResponseBodySchema = z.object({
  code: z.string(),
  client_info: z.string().optional(),
  state: z.string(),
  session_state: z.string().optional(),
});

// Note: there are many more fields in the authentication result, but these are
// the only ones we care about
// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/src/response/AuthenticationResult.ts
export const EntraIdAuthenticationResultSchema = z.object({
  accessToken: z.string(),
  account: z.object({
    idTokenClaims: EntraIdUserSchema,
  }),
});
