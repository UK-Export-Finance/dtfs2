/**
 * To use with date-fns/format
 *
 * e.g '30/01/2024'
 *
 * Equivalent to DD/MM/YYYY in moment().format()
 *
 * {@link https://date-fns.org/v3.3.1/docs/format}
 *
 */
export const FULL_DATE = 'dd/MM/yyyy';

/**
 * To use with date-fns/format
 *
 * e.g. '30/01/2024 14:30'
 *
 * Equivalent to DD/MM/YYYY HH:mm in moment().format()
 *
 * {@link https://date-fns.org/v3.3.1/docs/format}
 */
export const FULL_DATE_AND_TIME = 'dd/MM/yyyy HH:mm';

/**
 * For use with date-fns format method.
 *
 * e.g. '1st February 2024'
 *
 * Equivalent to 'Do MMMM YYYY' in moment().format()
 *
 * {@link https://date-fns.org/v3.3.1/docs/format}
 */
export const LONG_FORM_DATE = 'do MMMM yyyy';
