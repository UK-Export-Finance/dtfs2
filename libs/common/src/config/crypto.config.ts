import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const cryptoConfigSchema = z.object({
  BYTE_GENERATOR_PROVIDER: z.string().default('cryptographically-strong'),
  HASH_STRATEGY_PROVIDER: z.string().default('pbkdf2-sha512'),
});

export const cryptoConfig = cryptoConfigSchema.parse(process.env);
