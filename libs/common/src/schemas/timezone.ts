import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const { TZ } = process.env;

/**
 * {@link https://www.iana.org/time-zones}
 * There is no default for unset values in this config, as this would allow for inconsistency in microservices.
 */
const timezoneConfigSchema = z
  .object({
    TZ: z.string().default('Europe/London'),
  })
  .transform((parsedEnvVars) => {
    return {
      DEFAULT: parsedEnvVars.TZ,
    };
  });

const data = {
  TZ,
};

export const timezoneConfig = timezoneConfigSchema.parse(data);
