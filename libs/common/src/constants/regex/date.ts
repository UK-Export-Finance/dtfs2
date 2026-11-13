/**
 * Matches an ISO month string in the format `yyyy-MM`.
 *
 * Examples:
 * - `2024-01` (January 2024)
 * - `2024-12` (December 2024)
 *
 * Does not match:
 * - `2024-1` (month not zero-padded)
 * - `24-01` (year not 4 digits)
 */
export const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/;

/**
 * Matches an ISO year string in the format `yyyy`.
 *
 * Examples:
 * - `2024` (4-digit year)
 *
 * Does not match:
 * - `24` (fewer than 4 digits)
 * - `20245` (more than 4 digits)
 */
export const ISO_YEAR_REGEX = /^\d{4}$/;

/**
 * Matches an ISO datetime stamp in the format `yyyy-MM-ddTHH:mm:ss.sss +HH:mm`.
 * ISO datetimes throughout the codebase vary due to mixed implementation;
 * this regex complies with what `getNowAsUtcISOString` returns.
 *
 * Examples:
 * - `2024-01-15T14:30:45.123 +00:00` (space before the UTC offset)
 *
 * Does not match:
 * - `2024-01-15T14:30:45.123+00:00` (missing space before the UTC offset)
 */
export const ISO_DATE_TIME_STAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3} \+\d{2}:\d{2}$/;
