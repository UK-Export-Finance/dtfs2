const moment = require('moment');

const isDate = (dateStr) => moment(dateStr, 'YYYY-MM-DD', true).isValid();
const isEpoch = (epoch) => moment(epoch, 'x', true).isValid() || moment(epoch, 'X', true).isValid();
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
 * @returns {moment.Moment}
 */
const getMomentFromYearMonthDay = (year, month, day) => moment([
  Number(formatYear(year)),
  Number(month) - 1,
  Number(day),
]);

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
  getMomentFromYearMonthDay,
};
