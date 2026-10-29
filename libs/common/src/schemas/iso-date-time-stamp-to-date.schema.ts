import zod from 'zod';
import { parseISO } from 'date-fns';
import { IsoDateTimeStamp } from '@ukef/types';

export const ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA = zod
  .string()
  .datetime({ offset: true })
  .transform((isoTimestamp: IsoDateTimeStamp) => parseISO(isoTimestamp));
