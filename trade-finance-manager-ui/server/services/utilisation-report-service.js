const { format, subMonths } = require('date-fns');
const api = require('../api');
const { getBusinessDayOfMonth } = require('../helpers/date');
const { BANK_HOLIDAY_REGION } = require('../constants');

/**
 * Fetches a list of bank holiday dates for the specified UK region
 * @param {string} userToken - Token to validate session
 * @param {'england-and-wales' | 'scotland' | 'northern-ireland'} region
 * @returns {Promise<Date[]>}
 */
const getBankHolidays = async (userToken, region) => {
  const bankHolidays = await api.getUkBankHolidays(userToken);
  return bankHolidays[region].events.map((event) => new Date(event.date));
};

/**
 * Returns the utilisation report due date for the current month
 * @returns {Promise<Date>}
 */
const getReportDueDate = async (userToken) => {
  const bankHolidays = await getBankHolidays(userToken, BANK_HOLIDAY_REGION.ENGLAND_AND_WALES);
  const businessDay = parseInt(process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH, 10);
  const dateInReportMonth = new Date();
  return getBusinessDayOfMonth(dateInReportMonth, bankHolidays, businessDay);
};

/**
 * Returns the utilisation report due date for the current month in 'do MMMM yyyy' format
 * @returns {Promise<string>}
 */
const getFormattedReportDueDate = async (userToken) => {
  const reportDueDate = await getReportDueDate(userToken);
  return format(reportDueDate, 'd MMMM yyyy');
};

/**
 * Returns the current report period (i.e. the previous month) in 'MMMM yyyy' format
 * @returns {string}
 */
const getFormattedReportPeriod = () => {
  const lastMonthDate = subMonths(new Date(), 1);
  return format(lastMonthDate, 'MMMM yyyy');
};

module.exports = {
  getFormattedReportDueDate,
  getFormattedReportPeriod,
};
