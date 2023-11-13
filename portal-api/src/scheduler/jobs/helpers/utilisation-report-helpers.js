const { startOfMonth, format, subMonths } = require('date-fns');
const externalApi = require('../../../external-api/api');
const { addBusinessDaysWithHolidays } = require('../../../utils/date');

const DEFAULT_PAYMENT_OFFICER_TEAM_NAME = 'Team';

/**
 * Returns the utilisation report due date for the current month
 * @returns {Promise<Date>}
 */
const getReportDueDate = async () => {
  const bankHolidays = await externalApi.bankHolidays.getBankHolidayDatesForRegion('england-and-wales');
  return addBusinessDaysWithHolidays(startOfMonth(new Date()), process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH, bankHolidays);
};

/**
 * Returns the utilisation report due date for the current month in 'do MMMM yyyy' format
 * @returns {Promise<string>}
 */
const getFormattedReportDueDate = async () => {
  const reportDueDate = await getReportDueDate();
  return format(reportDueDate, 'd MMMM yyyy');
};

/**
 * Returns the month (1-indexed) and year of the current report period (i.e. the previous month)
 * @returns {{ month: number, year: number }}
 */
const getReportPeriodMonthAndYear = () => {
  const lastMonthDate = subMonths(new Date(), 1);
  const oneIndexedMonth = lastMonthDate.getMonth() + 1;
  return { month: oneIndexedMonth, year: lastMonthDate.getFullYear() };
};

/**
 * Returns the current report period (i.e. the previous month) in 'MMMM yyyy' format
 * @returns {string}
 */
const getFormattedReportPeriod = () => {
  const lastMonthDate = subMonths(new Date(), 1);
  return format(lastMonthDate, 'MMMM yyyy');
};

/**
 * Get the email recipient from the bank specific paymentOfficerTeam or fall
 * back to a generic default
 * @param paymentOfficerTeam {object} - the details of the payment officer team of the bank
 * @param bankName {string} - the name of the bank (used for logging)
 * @returns {string}
 */
const getEmailRecipient = (paymentOfficerTeam, bankName) => {
  if (!paymentOfficerTeam?.teamName) {
    console.warn(`Bank '${bankName}' missing a payment officer team name. Using default '${DEFAULT_PAYMENT_OFFICER_TEAM_NAME}'`);
    return DEFAULT_PAYMENT_OFFICER_TEAM_NAME;
  }

  return paymentOfficerTeam.teamName;
};

module.exports = {
  getReportDueDate,
  getFormattedReportDueDate,
  getReportPeriodMonthAndYear,
  getFormattedReportPeriod,
  getEmailRecipient,
};
