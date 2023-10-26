const { addBusinessDaysWithHolidays } = require('../../../helpers/addBusinessDays');
const api = require('../../../api');

/**
 * Calls the Gov UK bank holidays API to get a list of public holidays, uses only
 * events for England and Wales and maps to date.
 * @returns {Promise} - List of dates as an array.
 */
const getBankHolidays = async (userToken) => {
  const bankHolidaysFromGovApi = await api.getUkBankHolidays(userToken);
  // Should I filter by month and year here?
  return bankHolidaysFromGovApi['england-and-wales'].events.map((event) => new Date(event.date));
};
// what if this goes down?

/**
 * Gets the reporting period based off the 1st day of the current month.
 * @param {Date} firstDayOfCurrentMonth - The value to test for being a number.
 * @returns {string} - Previous Month (long) and Year (numeric) as a string.
 */
const getCurrentReportPeriod = (firstDayOfCurrentMonth) => {
  const reportDate = new Date(firstDayOfCurrentMonth.getFullYear(), firstDayOfCurrentMonth.getMonth() - 1, 1);
  return reportDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
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

module.exports = {
  getBankHolidays,
  getCurrentReportPeriod,
  getCurrentReportDueDate,
};
