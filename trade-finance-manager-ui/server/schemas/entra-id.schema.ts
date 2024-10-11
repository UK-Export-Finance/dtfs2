import { z } from 'zod';

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
