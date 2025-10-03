/**
 * Format strings use with date-fns format method.
 *
 * {@link https://date-fns.org/v3.3.1/docs/format}
 */
export const DATE_FORMATS = {
  // e.g. '1st February 2024'
  DO_MMMM_YYYY: 'do MMMM yyyy',
  D_MMMM_YYYY: 'd MMMM yyyy',
  H_MMAAA: 'H:mmaaa', // e.g 12:34am
  DD_MMM_YYYY: 'dd MMM yyyy', // e.g. '01 Feb 2024'
  DD_MMMM_YYYY: 'dd MMMM yyyy', // e.g. '01 February 2024'
  YYYY_MM_DD: 'yyyy-MM-dd',
};

/**
 * Constants representing epoch-related values.
 *
 * @remarks
 * `EPOCH.MS.ONE_DAY` is the number of milliseconds in one day (24 hours).
 * Above is derived from 1000 ms * 60 seconds * 60 minutes * 24 hours
 */
export const EPOCH = {
  MS: {
    ONE_DAY: 86400000,
  },
};
