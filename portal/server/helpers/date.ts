/**
 * Returns the current datetime as a 13 digit Unix timestamp: the time in
 * milliseconds that has elapsed since 1st January 1970 (UTC).
 *
 * e.g. A Unix timestamp of 1702900314000 is equivalent to an ISO 8601 date
 * time stamp of '2023-12-18T11:51:54Z'
 *
 */
export const getNowAsEpoch = () => Date.now();
