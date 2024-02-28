const moment = require('moment');

/**
 * @param {string} dateStr
 * @returns {boolean} true if the date string is a valid date in the format `yyyy-MM-dd`
 * Does not allow date of month to wrap or months > 12 (e.g 2024-13-32 is invalid)
 */
const isDate = (dateStr) => moment(dateStr, 'YYYY-MM-DD', true).isValid();
/**
 * @param {string | number} epoch
 * @returns {boolean} true if the value given is a unix epoch in seconds or milliseconds
 * Epoch time must be less than 8640000000000000 {@link https://262.ecma-international.org/5.1/#sec-15.9.1.1 | (see docs)}
 */
const isEpoch = (epoch) => moment(epoch, 'x', true).isValid() || moment(epoch, 'X', true).isValid();
/**
 * @param {unknown} dateStr
 * @returns true if the value is a string and not an epoch
 */
const isString = (dateStr) => typeof dateStr === 'string' && !isEpoch(dateStr);
const now = () => moment().format('YYYY-MM-DD');

const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
const formatDate = (dateStr) => moment(isDate(dateStr) || isString(dateStr) ? dateStr : Number(dateStr)).format('YYYY-MM-DD');
const formatTimestamp = (dateStr) => moment(isDate(dateStr) || isString(dateStr) ? dateStr : Number(dateStr)).format('YYYY-MM-DD');

const addDay = (date, day) => moment(date).add({ day }).format('YYYY-MM-DD');
const addMonth = (date, months) => moment(date).add({ months }).format('YYYY-MM-DD');
const addYear = (date, years) => moment(date).add({ years }).format('YYYY-MM-DD');

/**
 * @returns {string} current date as ISO-8601 string (e.g. 2024-02-16T16:57:23+00:00)
 */
const getNowAsIsoString = () => moment().format();

/**
 * @param {string} startDate
 * @param {string} endDate
 * @returns {number} difference in months between dates, rounded down
 */
const getMonthDifference = (startDate, endDate) => moment(endDate).diff(moment(startDate), 'months');

/**
 * @param {string} date1
 * @param {string} date2
 * @returns {boolean}
 */
const isSameDayOfMonth = (date1, date2) => moment(date1).date() === moment(date2).date();

/**
 * @param {string | number} day day of the month
 * @param {string | number} month 1 indexed month of the year
 * @param {string | number} year
 * @returns {string} formatted as `yyyy-MM-dd`
 */
const getDateStringFromYearMonthDay = (year, month, day) => moment([
  Number(formatYear(year)),
  Number(month) - 1,
  Number(day),
]).format('YYYY-MM-DD');

module.exports = {
  isDate,
  isEpoch,
  isString,
  now,
  formatDate,
  formatTimestamp,
  formatYear,
  addDay,
  addMonth,
  addYear,
  getNowAsIsoString,
  getMonthDifference,
  isSameDayOfMonth,
  getDateStringFromYearMonthDay,
};
