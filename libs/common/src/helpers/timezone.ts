import dotenv from 'dotenv';
import { TIMEZONE } from '../constants/timezone';

dotenv.config();

const { TZ } = process.env;

/**
 * The timezone to use for the application.
 * It defaults to TIMEZONE.DEFAULT if the TZ environment variable is not set.
 */
export const timezone = TZ ?? TIMEZONE.DEFAULT;
