import { z } from 'zod';
import dotenv from 'dotenv';
import { zBooleanCoerce } from '../helpers/schemas/z-boolean-coerce';

dotenv.config();

const sqlDbConfigSchema = z.object({
  SQL_DB_HOST: z.string(),
  SQL_DB_PORT: z.coerce.number(),
  SQL_DB_USERNAME: z.string(),
  SQL_DB_PASSWORD: z.string(),
  SQL_DB_NAME: z.string(),
  SQL_DB_LOGGING_ENABLED: zBooleanCoerce,
});

export const sqlDbConfig = sqlDbConfigSchema.parse(process.env);
