import { z } from 'zod';
import { DecodedAuthCodeRequestStateSchema, EntraIdAuthCodeRedirectResponseBodySchema, EntraIdAuthenticationResultSchema } from '../schemas';

export type DecodedAuthCodeRequestState = z.infer<typeof DecodedAuthCodeRequestStateSchema>;

export type EntraIdAuthCodeRedirectResponseBody = z.infer<typeof EntraIdAuthCodeRedirectResponseBodySchema>;

export type EntraIdAuthenticationResult = z.infer<typeof EntraIdAuthenticationResultSchema>;
