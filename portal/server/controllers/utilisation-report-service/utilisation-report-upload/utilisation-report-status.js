const { addBusinessDaysWithHolidays } = require('../../../helpers/addBusinessDays');
const api = require('../../../api');

/**
 * Calls the Gov UK bank holidays API to get a list of public holidays, uses only
 * events for England and Wales and maps to date.
 * @returns {Promise} - List of dates as an array.
 */
const getBankHolidays = async (userToken) => {
  const bankHolidaysFromGovApi = await api.getUkBankHolidays(userToken);
  return bankHolidaysFromGovApi['england-and-wales'].events.map((event) => new Date(event.date));
};

/**
 * Gets the reporting period based off the 1st day of the current month.
 * @param {Date} firstDayOfCurrentMonth - The value to test for being a number.
 * @returns {string} - Previous Month (long) and Year (numeric) as a string.
 */
const getCurrentReportPeriod = (firstDayOfCurrentMonth) => {
  const reportDate = new Date(firstDayOfCurrentMonth.getFullYear(), firstDayOfCurrentMonth.getMonth() - 1, 1);
  const reportPeriod = reportDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
  return { reportPeriod, month: reportDate.getMonth() + 1, year: reportDate.getFullYear() };
};

/**
 * Gets the current report due date based off the 1st day of the current month.
 * @param {Date} firstDayOfCurrentMonth - The value to test for being a number.
 * @returns {Promise} - Due Date (numeric), Month (long) and Year (numeric) as a string.
 */
const getCurrentReportDueDate = async (firstDayOfCurrentMonth, userToken) => {
  const bankHolidays = await getBankHolidays(userToken);
  const dateAdd10BusinessDays = addBusinessDaysWithHolidays(firstDayOfCurrentMonth, 10, bankHolidays);
  return dateAdd10BusinessDays.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getDueReportDetails = async (userToken) => {
  const currentDate = new Date();
  const firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const { reportPeriod, month, year } = getCurrentReportPeriod(firstDayOfCurrentMonth);
  const reportDueDate = await getCurrentReportDueDate(firstDayOfCurrentMonth, userToken);
  return { reportDueDate, reportPeriod, month, year };
};

module.exports = {
  getBankHolidays,
  getCurrentReportPeriod,
  getCurrentReportDueDate,
  getDueReportDetails
};
