import z from 'zod';
/**
 * ISO datetimes throughout the codebase vary due to mixed implimentation
 * The following regex complies with whatgetNowAsUtcISOString returns
 */
const isoDateTimeStampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3} \+\d{2}:\d{2}$/;
export const ISO_DATE_TIME_STAMP_SCHEMA = z.string().regex(isoDateTimeStampRegex);
