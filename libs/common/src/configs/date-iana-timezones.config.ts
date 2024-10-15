import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * {@link https://www.iana.org/time-zones}
 * There is no default provided in this config, as this would allow for inconsistency in microservices.
 */
const defaultIanaTimezoneConfigSchema = z
  .object({
    TZ: z.string(),
  })
  .transform((validatedEnvVars) => ({
    DEFAULT: validatedEnvVars.TZ,
  }));

export const dateIanaTimezoneConfig = defaultIanaTimezoneConfigSchema.parse(process.env);
