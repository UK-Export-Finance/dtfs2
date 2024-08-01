/**
 * Converts the supplied timestamp to a date object
 * after checking whether or not the timestamp is
 * in seconds or milliseconds
 * @param timestamp- The timestamp to convert
 * @returns A date object
 * @throws {Error} If the supplied timestamp cannot be converted to a unix timestamp
 */
export const convertTimestampToDate = (timestamp: string | number | Date): Date => {
  if (!(timestamp instanceof Date) && !/^\d+$/.test(timestamp.toString())) {
    throw new Error(`Expected timestamp to be either a date object, number or string of digits (received '${timestamp}')`);
  }

  const timestampAsNumber = Number(timestamp);
  if (timestampAsNumber.toString().length === 10) {
    return new Date(timestampAsNumber * 1000); // convert from seconds to milliseconds
  }
  return new Date(timestampAsNumber);
};
