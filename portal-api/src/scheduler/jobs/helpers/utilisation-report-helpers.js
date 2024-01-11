const { format, subMonths } = require('date-fns');
const externalApi = require('../../../external-api/api');
const api = require('../../../v1/api');
const { getBusinessDayOfMonth } = require('../../../utils/date');
const { hasValue, isValidEmail } = require('../../../utils/string');
const { BANK_HOLIDAY_REGION } = require('../../../constants/bank-holiday-region');

/**
 * @typedef {({ emailAddress: string, recipient: string }) => Promise<void>} SendEmailCallback
 */

const DEFAULT_PAYMENT_OFFICER_TEAM_NAME = 'Team';

/**
 * Returns the utilisation report due date for the current month
 * @returns {Promise<Date>}
 */
const getReportDueDate = async () => {
  const bankHolidays = await externalApi.bankHolidays.getBankHolidayDatesForRegion(BANK_HOLIDAY_REGION.ENGLAND_AND_WALES);
  const businessDay = Number.parseInt(process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH, 10);
  const dateInReportMonth = new Date();
  return getBusinessDayOfMonth(dateInReportMonth, bankHolidays, businessDay);
};

/**
 * Returns the utilisation report due date for the current month in 'd MMMM yyyy' format
 * @returns {Promise<string>}
 */
const getFormattedReportDueDate = async () => {
  const reportDueDate = await getReportDueDate();
  return format(reportDueDate, 'd MMMM yyyy');
};

/**
 * Returns the utilisation report chaser date for the current month - i.e. the date that a follow-up email should be
 * sent to the bank to chase a report if not received by the due date
 * @returns {Promise<Date>}
 */
const getReportOverdueChaserDate = async () => {
  const bankHolidays = await externalApi.bankHolidays.getBankHolidayDatesForRegion(BANK_HOLIDAY_REGION.ENGLAND_AND_WALES);
  const businessDay = Number.parseInt(process.env.UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH, 10);
  const dateInReportMonth = new Date();
  return getBusinessDayOfMonth(dateInReportMonth, bankHolidays, businessDay);
};

/**
 * Returns the start and end months (1-indexed) and years of the current report period (i.e. the previous month)
 * @returns {{ start: {month: number, year: number}, end: {month: number, year: number} }}
 */
const getReportPeriod = () => {
  const lastMonthDate = subMonths(new Date(), 1);
  const oneIndexedMonth = lastMonthDate.getMonth() + 1;
  return {
    start: {
      month: oneIndexedMonth,
      year: lastMonthDate.getFullYear()
    },
    end: {
      month: oneIndexedMonth,
      year: lastMonthDate.getFullYear()
    }
  };
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
 * Checks if a utilisation report has already been submitted by the specified bank for the current reporting period
 * @param bank {object} - the bank to check
 * @returns {Promise<boolean>}
 */
const getIsReportSubmitted = async (bank) => {
  const reportPeriod = getReportPeriod();
  const reportsResponse = await api.getUtilisationReports(bank.id, reportPeriod);
  return reportsResponse.length > 0;
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

/**
 * Sends the email to the specified bank when a valid payment officer team email is present
 * @param emailDescription {string} - a description of the email (used for logging)
 * @param sendEmailCallback {SendEmailCallback} - callback function that sends the required email.
 *   The callback is provided the following argument `{ emailAddress: string; recipient: string }`,
 *   extracted from the provided bank.
 * @param bank {object} - the bank to send the email to
 * @returns {Promise<void>}
 */
const sendEmailForBank = async ({ emailDescription, sendEmailCallback, bank }) => {
  const { name: bankName, paymentOfficerTeam } = bank;
  const paymentOfficerTeamEmail = paymentOfficerTeam?.email;

  try {
    if (!hasValue(paymentOfficerTeamEmail)) {
      console.warn(`Not sending ${emailDescription} email to '${bankName}' - no payment officer team email set`);
    } else if (!isValidEmail(paymentOfficerTeamEmail)) {
      console.error(`Failed to send ${emailDescription} email to '${bankName}' - invalid payment officer team email '${paymentOfficerTeamEmail}'`);
    } else {
      await sendEmailCallback({
        emailAddress: paymentOfficerTeamEmail,
        recipient: getEmailRecipient(paymentOfficerTeam, bankName),
      });
      console.info(`Successfully sent ${emailDescription} email to '${bankName}'`);
    }
  } catch (error) {
    console.error(`Failed to send ${emailDescription} email for bank '${bankName}':`, error);
  }
};

/**
 * For all banks, checks if a utilisation report has been received for the current reporting period
 * then, where not yet received, attempts to call the provided callback function to send the required email
 * @param emailDescription {string} - a description of the email (used for logging)
 * @param sendEmailCallback {SendEmailCallback} - callback function that sends the required email.
 *   The callback is provided the following argument `{ emailAddress: string; recipient: string }`,
 *   extracted from the provided bank.
 * @returns {Promise<void>}
 */
const sendEmailToAllBanksWhereReportNotReceived = async ({ emailDescription, sendEmailCallback }) => {
  console.info(`Attempting to send ${emailDescription} emails`);

  const banks = await api.getAllBanks();
  const reportPeriod = getFormattedReportPeriod();

  for (const bank of banks) {
    const { name: bankName, id: bankId } = bank;

    try {
      const isReportSubmitted = await getIsReportSubmitted(bank);

      if (isReportSubmitted) {
        console.info(
          `Not sending '${emailDescription}' email to '${bankName}' (bank ID: ${bankId}) - report has already been submitted for ${reportPeriod} report period`,
        );
      } else {
        await sendEmailForBank({ emailDescription, sendEmailCallback, bank });
        console.info(`Successfully sent '${emailDescription}' email to '${bankName}' (bank ID: ${bankId})`);
      }
    } catch (error) {
      console.error(`Failed to send '${emailDescription}' email to '${bankName}' (bank ID: ${bankId})`, error);
    }
  }

  console.info(`Finished sending '${emailDescription}' emails`);
};

module.exports = {
  getReportDueDate,
  getFormattedReportDueDate,
  getReportOverdueChaserDate,
  getReportPeriod,
  getFormattedReportPeriod,
  getIsReportSubmitted,
  getEmailRecipient,
  sendEmailToAllBanksWhereReportNotReceived,
};
