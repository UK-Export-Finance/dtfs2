/**
 * Date helper functions
 */

/**
 * Return's EPOCH from a date time string
 * @param {String} string Date time
 * @returns {Intger} EPOCH with ms
 */
const getEpoch = (string) => {
  if (string) {
    return new Date(string).valueOf();
  }

  return 0;
};

/**
 * Returns formatted date string in `DD-MM-YYYY` format from an EPOCH integer argument.
 * @param {Integer} epoch EPOCH
 * @returns {String} Formatted date string, `Invalid` if null provided.
 */
const getDDMMYYYY = (epoch) => {
  if (epoch) {
    const formatted = [];
    const date = new Date(epoch);

    // Date
    formatted[0] = date.getDate().toString().padStart(2, '0');
    // Month
    formatted[1] = (date.getMonth() + 1);
    formatted[1] = formatted[1].toString().padStart(2, '0');
    // Year
    formatted[2] = date.getFullYear().toString();

    return formatted.join('-');
  }
  return 'Invalid';
};

/**
 *  Converts milliseconds EPOCH to seconds only.
 * @param {Integer} epoch EPOCH in milliseconds
 * @returns {Integer} EPOCH in seconds, `0` if null provided.
 */
const epochInSeconds = (epoch) => (epoch ? Math.trunc(epoch / 1000) : 0);

/**
 * Converts an excel date to ISO Date string
 * @param {Integer} excelDateNumber
 * @returns ISO date
 */
const excelDateToISODateString = (excelDateNumber) => new Date(Math.round((excelDateNumber - 25569) * 86400 * 1000)).toISOString().substring(0, 10);

/**
 * Appends Timestamp to the date with zero hours, minutes and seconds.
 * @param {String} date Date in `YYYY-MM-DD` format
 * @returns {String} Timestamp formatted date in `YYYY-MM-DDT00:00:00` format
 */
const getStringTimestamp = (date) => {
  if (date) {
    return date.toString().concat('T00:00:00');
  }
  return date;
};

module.exports = {
  getEpoch,
  getDDMMYYYY,
  epochInSeconds,
  excelDateToISODateString,
  getStringTimestamp
};
