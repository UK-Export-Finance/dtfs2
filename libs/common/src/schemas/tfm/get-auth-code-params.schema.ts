import { z } from 'zod';

export const GET_AUTH_CODE_PARAMS_SCHEMA = z.object({
  successRedirect: z.string(),
});
