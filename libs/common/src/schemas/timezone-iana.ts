import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * {@link https://www.iana.org/time-zones}
 * There is no default for unset values in this config, as this would allow for inconsistency in microservices.
 */
const defaultTimeZoneSchema = z.object({
  TZ: z.string(),
});

export const timeZoneConfig = defaultTimeZoneSchema.parse(process.env);
