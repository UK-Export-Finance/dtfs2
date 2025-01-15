import { z } from 'zod';
import { TFM_SESSION_USER_SCHEMA } from './tfm-session-user.schema';

export const HANDLE_SSO_REDIRECT_FORM_RESPONSE_SCHEMA = z.object({
  user: TFM_SESSION_USER_SCHEMA,
  token: z.string(),
  expires: z.string(),
  successRedirect: z.string().optional(),
});
