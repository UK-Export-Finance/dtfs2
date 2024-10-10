import { z } from 'zod';
import { DecodedAuthCodeRequestStateSchema, EntraIdAuthCodeRedirectResponseBodySchema } from '../schemas';

export type DecodedAuthCodeRequestState = z.infer<typeof DecodedAuthCodeRequestStateSchema>;

export type EntraIdAuthCodeRedirectResponseBody = z.infer<typeof EntraIdAuthCodeRedirectResponseBodySchema>;
