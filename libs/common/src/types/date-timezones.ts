/**
 * IANA timezone type
 * Note - If needing a more restrictive type, we should look to internalise the
 * return from Intl.supportedValuesOf('timeZone')
 * {@link https://www.iana.org/time-zones}
 */
export type IanaTimezone = string;
