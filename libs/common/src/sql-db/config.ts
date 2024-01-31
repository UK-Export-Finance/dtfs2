import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const sqlDbConfigSchema = z.object({
  SQL_DB_HOST: z.string(),
  SQL_DB_PORT: z.coerce.number(),
  SQL_DB_USERNAME: z.string(),
  SQL_DB_PASSWORD: z.string(),
  SQL_DB_NAME: z.string(),
  SQL_DB_LOGGING: z.coerce.boolean(),
});

export const sqlDbConfig = sqlDbConfigSchema.parse(process.env);
