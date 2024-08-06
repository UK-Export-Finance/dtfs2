import { UnixTimestamp, UnixTimestampString } from '@ukef/dtfs2-common';

const isTimestampStoredInSeconds = (timestamp: UnixTimestampString): boolean => timestamp.length === 10;

const isTimestampStoredInMilliseconds = (timestamp: UnixTimestampString): boolean => timestamp.length === 13;

const convertToMilliseconds = (timestampInSeconds: UnixTimestamp): number => timestampInSeconds * 1000;

/**
 * Converts the supplied timestamp to a date object
 * after checking whether or not the timestamp is
 * in seconds or milliseconds
 * @param timestamp - The timestamp to convert
 * @returns A date object
 * @throws {Error} If the supplied timestamp cannot be converted to a unix timestamp
 * @throws {Error} If the supplied timestamp is not a comprised of either 10 or 13 digits
 */
export const convertTimestampToDate = (timestamp: string | number | Date): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  const timestampAsString = timestamp.toString();
  if (!/^\d+$/.test(timestampAsString)) {
    throw new Error(`Expected timestamp to be either a date object, number or string of digits (received '${timestamp}')`);
  }

  const timestampAsNumber = parseInt(timestampAsString, 10);

  if (isTimestampStoredInSeconds(timestampAsString)) {
    return new Date(convertToMilliseconds(timestampAsNumber));
  }

  if (isTimestampStoredInMilliseconds(timestampAsString)) {
    return new Date(timestampAsNumber);
  }

  throw new Error('Supplied timestamp did not have either 10 or 13 digits');
};
