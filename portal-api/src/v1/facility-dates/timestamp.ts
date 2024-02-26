import { formatISO, isValid } from 'date-fns';
import { getStartOfDateFromEpochMillisecondString } from '../helpers/date';

// TODO: DTFS2-6994 remove this function once all files are updated
export const formattedTimestamp = (timestamp: string) => {
  const date = getStartOfDateFromEpochMillisecondString(timestamp);

  return isValid(date) ? formatISO(date) : '';
};
