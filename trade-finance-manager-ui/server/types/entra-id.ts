import { z } from 'zod';

export const DecodedAuthCodeRequestStateSchema = z.object({
  csrfToken: z.string(),
  successRedirect: z.string().optional(),
});

export type DecodedAuthCodeRequestState = z.infer<typeof DecodedAuthCodeRequestStateSchema>;
