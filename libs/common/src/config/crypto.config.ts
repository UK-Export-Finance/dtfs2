import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const BYTE_GENERATOR_PROVIDERS = ['cryptographically-strong'] as const;
const byteGeneratorProviders = z.enum(BYTE_GENERATOR_PROVIDERS).default('cryptographically-strong');
type ByteGeneratorProviders = z.infer<typeof byteGeneratorProviders>;

const HASH_STRATEGY_PROVIDERS = ['pbkdf2-sha512'] as const;
const hashStrategyProviders = z.enum(HASH_STRATEGY_PROVIDERS).default('pbkdf2-sha512');
type HashStrategyProviders = z.infer<typeof hashStrategyProviders>;

const byteGeneratorProvider: ByteGeneratorProviders = byteGeneratorProviders.parse(process.env.BYTE_GENERATOR_PROVIDER);
const hashStrategyProvider: HashStrategyProviders = hashStrategyProviders.parse(process.env.HASH_STRATEGY_PROVIDER);

export const cryptoConfig = {
  byteGeneratorProvider,
  hashStrategyProvider,
};
