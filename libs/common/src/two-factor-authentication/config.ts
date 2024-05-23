import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const twoFactorAuthenticationConfigSchema = z.object({
  SQL_DB_HOST: z.string(),
  SQL_DB_PORT: z.coerce.number(),
  SQL_DB_USERNAME: z.string(),
  SQL_DB_PASSWORD: z.string(),
  SQL_DB_NAME: z.string(),
  SQL_DB_LOGGING_ENABLED: z.coerce.boolean(),
});

export const twoFactorAuthenticationConfig = twoFactorAuthenticationConfigSchema.parse(process.env);
