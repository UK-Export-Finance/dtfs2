import z from 'zod';
import { REGEX } from '@ukef/constants/regex';

export const ISO_DATE_TIME_STAMP_SCHEMA = z.string().regex(REGEX.ISO_DATE_TIME_STAMP_REGEX);
