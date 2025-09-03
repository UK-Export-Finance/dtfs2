const { subMonths, format, addMonths } = require('date-fns');
const { getFormattedReportPeriodWithLongMonth } = require('@ukef/dtfs2-common');
const { getBusinessDayOfMonth } = require('../../../helpers');
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
 * Gets the current report due date based off the 1st day of the current month.
 * @param {string} userToken - Token to validate session
 * @param {Date} [reportPeriodEndDate] - Report period as a Date object (defaults to previous month)
 * @returns {Promise<string>} - Due Date (numeric), Month (long) and Year (numeric) as a string.
 */
const getReportDueDate = async (userToken, reportPeriodEndDate = subMonths(new Date(), 1)) => {
  const bankHolidays = await getBankHolidays(userToken);
  const reportDueDate = getBusinessDayOfMonth(addMonths(reportPeriodEndDate, 1), bankHolidays, 10);
  return format(reportDueDate, 'd MMMM yyyy');
};

/**
 * Returns an array of due report dates including the one-indexed month,
 * the year and the report period with format 'MMMM yyyy'
 * @param {string} userToken - Token to validate session
 * @param {string} bankId - ID of the bank
 * @returns {Promise<{ start: {month: number, year: number}, end: {month: number, year: number}, formattedReportPeriod: string }[]>}
 */
const getDueReportPeriodsByBankId = async (userToken, bankId) => {
  const dueReportPeriods = await api.getDueReportPeriodsByBankId(userToken, bankId);
  return dueReportPeriods.map((dueReportPeriod) => {
    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(dueReportPeriod);
    return { ...dueReportPeriod, formattedReportPeriod };
  });
};

module.exports = {
  getBankHolidays,
  getReportDueDate,
  getDueReportPeriodsByBankId,
};
