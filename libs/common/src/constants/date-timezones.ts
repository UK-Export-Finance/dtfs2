import { IanaTimezone } from '../types';

/**
 * IANA timezones used in the codebase
 * Note - If needing a full list, we should look to Intl.supportedValuesOf('timeZone')
 * {@link https://www.iana.org/time-zones}
 */
export const IANA_TIMEZONES = { LONDON: 'Europe/London' } as const satisfies Record<string, IanaTimezone>;
