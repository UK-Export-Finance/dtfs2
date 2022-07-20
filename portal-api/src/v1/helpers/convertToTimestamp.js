/**
 * @param {String} time
 * @returns {Date} timestamp
 * Helper function to take time as String (eg July 19, 2022)
 * Converts to utc timestamp by getting year date and month and setting hours to midnight
 * returns in date format
 */
const convertToTimestamp = (time) => {
  const date = new Date(time);
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

  return new Date(utc);
};

module.exports = convertToTimestamp;
