/**
 * Date helper functions
 */

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
 *  Converts milliseconds EPOCH to secods only.
 * @param {Integer} epoch EPOCH in milliseconds
 * @returns {Integer} EPOCH in seconds, `0` if null provided.
 */
const epochInSeconds = (epoch) => (epoch ? epoch / 1000 : 0);

/**
 * Converts an excel date to ISO Date string
 * @param {Integer} excelDateNumber
 * @returns ISO date
 */
const excelDateToISODateString = (excelDateNumber) => new Date(Math.round((excelDateNumber - 25569) * 86400 * 1000)).toISOString().substring(0, 10);

module.exports = {
  getDDMMYYYY,
  epochInSeconds,
  excelDateToISODateString
};
