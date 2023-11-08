const { addBusinessDaysWithHolidays } = require('../../../helpers/addBusinessDays');
const { getMonth, getYear, subMonths, startOfMonth, format } = require('date-fns');
const api = require('../../../api');

/**
 * Calls the Gov UK bank holidays API to get a list of public holidays, uses only
 * events for England and Wales and maps to date.
 * @param {Object} userToken - Token to validate session
 * @returns {Promise} - List of dates as an array.
 */
const getBankHolidays = async (userToken) => {
  const bankHolidaysFromGovApi = await api.getUkBankHolidays(userToken);
  return bankHolidaysFromGovApi['england-and-wales'].events.map((event) => new Date(event.date));
};

/**
 * Gets the due reporting period as string, month and year
 * @returns {{reportPeriod: string, month: number, year: number}} - Previous Month (long) and Year (numeric) as a string.
 */
const getReportPeriod = () => {
  const lastMonth = subMonths(startOfMonth(new Date()), 1);
  const reportPeriod = format(lastMonth, 'MMMM yyyy');
  return { reportPeriod, month: getMonth(lastMonth), year: getYear(lastMonth) };
};

/**
 * Gets the current report due date based off the 1st day of the current month.
 * @param {Object} userToken - Token to validate session
 * @returns {Promise<Date>} - Due Date (numeric), Month (long) and Year (numeric) as a string.
 */
const getReportDueDate = async (userToken) => {
  const bankHolidays = await getBankHolidays(userToken);
  const reportDueDate = addBusinessDaysWithHolidays(startOfMonth(new Date()), 10, bankHolidays);
  return format(reportDueDate, 'do MMMM yyyy');
};

/**
 * Gets the due report details - date, period, month & year
 * @param {Object} userToken - Token to validate session 
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
