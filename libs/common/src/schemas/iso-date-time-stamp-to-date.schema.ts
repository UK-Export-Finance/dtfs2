import z from 'zod';
import { parseISO } from 'date-fns';
import { IsoDateTimeStamp } from '../types';

export const ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA = z
  .string()
  .datetime({ offset: true })
  .transform((isoTimestamp: IsoDateTimeStamp) => parseISO(isoTimestamp));
