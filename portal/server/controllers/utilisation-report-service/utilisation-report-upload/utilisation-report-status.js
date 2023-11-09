const { getMonth, getYear, subMonths, startOfMonth, format } = require('date-fns');
const { addBusinessDaysWithHolidays } = require('../../../helpers/addBusinessDays');
const api = require('../../../api');

/**
 * Calls the Gov UK bank holidays API to get a list of public holidays, uses only
 * events for England and Wales and maps to date.
 * @param {Object} userToken - Token to validate session
 * @returns {Promise<Date[]>} - List of dates as an array.
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
  const lastMonth = subMonths(new Date(), 1);
  const reportPeriod = format(lastMonth, 'MMMM yyyy');
  const month = getMonth(lastMonth) + 1; // Account for javascript 0-index for months
  const year = getYear(lastMonth);
  return { reportPeriod, month, year };
};

/**
 * Gets the current report due date based off the 1st day of the current month.
 * @param {Object} userToken - Token to validate session
 * @returns {Promise<string>} - Due Date (numeric), Month (long) and Year (numeric) as a string.
 */
const getReportDueDate = async (userToken) => {
  const bankHolidays = await getBankHolidays(userToken);
  const reportDueDate = addBusinessDaysWithHolidays(startOfMonth(new Date()), 10, bankHolidays);
  return format(reportDueDate, 'd MMMM yyyy');
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
