const { getYear, subMonths, startOfMonth, format } = require('date-fns');
const { addBusinessDaysWithHolidays } = require('../../../helpers/addBusinessDays');
const { getOneIndexedMonth } = require('../../../helpers');
const api = require('../../../api');

/**
 * Calls the Gov UK bank holidays API to get a list of public holidays, uses only
 * events for England and Wales and maps to date.
 * @param {string} userToken - Token to validate session
 * @returns {Promise<Date[]>} - List of dates as an array.
 */
const getBankHolidays = async (userToken) => {
  const bankHolidays = await api.getUkBankHolidays(userToken);
  return bankHolidays['england-and-wales'].events.map((event) => new Date(event.date));
};

/**
 * Gets the due reporting period as string, month and year
 * @returns {{reportPeriod: string, month: number, year: number}} - Previous Month (long) and Year (numeric) as a string.
 */
const getReportPeriod = () => {
  const lastMonth = subMonths(new Date(), 1);
  const reportPeriod = format(lastMonth, 'MMMM yyyy');
  const month = getOneIndexedMonth(lastMonth);
  const year = getYear(lastMonth);
  return { reportPeriod, month, year };
};

/**
 * Gets the current report due date based off the 1st day of the current month.
 * @param {string} userToken - Token to validate session
 * @param {Date} reportPeriodDate - Optional report period as a Date object (defaults to previous month)
 * @returns {Promise<string>} - Due Date (numeric), Month (long) and Year (numeric) as a string.
 */
const getReportDueDate = async (userToken, reportPeriodDate = subMonths(new Date(), 1)) => {
  const bankHolidays = await getBankHolidays(userToken);
  const monthStart = startOfMonth(reportPeriodDate);
  const reportDueDate = addBusinessDaysWithHolidays(monthStart, 10, bankHolidays);
  return format(reportDueDate, 'd MMMM yyyy');
};

/**
 * Gets the due report details - date, period, month & year
 * @param {string} userToken - Token to validate session
 * @returns {Promise<Object>} - Object with Due Date, Report Period, Month and Year
 */
const getDueReportDetails = async (userToken) => {
  const { reportPeriod, month, year } = getReportPeriod();
  const reportDueDate = await getReportDueDate(userToken);
  return { reportDueDate, reportPeriod, month, year };
};

module.exports = {
  getBankHolidays,
  getReportPeriod,
  getReportDueDate,
  getDueReportDetails,
};
