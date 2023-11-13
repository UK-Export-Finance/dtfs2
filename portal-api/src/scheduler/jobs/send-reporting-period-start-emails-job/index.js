const api = require('../../../v1/api');
const sendEmail = require('../../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../../constants/email-template-ids');
const { hasValue, isValidEmail } = require('../../../utils/string');
const { getFormattedReportDueDate, getFormattedReportPeriod, getEmailRecipient } = require('../helpers/utilisation-report-helpers');

const { UTILISATION_REPORT_REPORTING_PERIOD_START_EMAIL_SCHEDULE } = process.env;

const EMAIL_NAME = 'GEF utilisation reporting period start';

/**
 * Sends the email to the specified bank when a valid payment officer team email is present
 * @param bank {object} - the bank to send the email to
 * @param reportPeriod {string} - the formatted reporting period that will appear in the email
 * @param reportDueDate {string} - the formatted report due date that will appear in the email
 */
const sendEmailForBank = async (bank, reportPeriod, reportDueDate) => {
  const { name: bankName, paymentOfficerTeam } = bank;
  const paymentOfficerTeamEmail = paymentOfficerTeam?.email;

  try {
    if (!hasValue(paymentOfficerTeamEmail)) {
      console.warn(`Not sending ${EMAIL_NAME} email to '${bankName}' - no payment officer team email set`);
    } else if (!isValidEmail(paymentOfficerTeamEmail)) {
      console.error(`Failed to send ${EMAIL_NAME} email to '${bankName}' - invalid payment officer team email '${paymentOfficerTeamEmail}'`);
    } else {
      await sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_PERIOD_START, paymentOfficerTeamEmail, {
        recipient: getEmailRecipient(paymentOfficerTeam, bankName),
        reportPeriod,
        reportDueDate,
      });
      console.info(`Successfully sent ${EMAIL_NAME} email to '${bankName}'`);
    }
  } catch (error) {
    console.error(`Failed to send ${EMAIL_NAME} for bank '${bankName}':`, error);
  }
};

/**
 * Attempts to send the email to all banks
 */
const sendEmails = async () => {
  console.info(`Attempting to send ${EMAIL_NAME} emails`);

  const banks = await api.getAllBanks();
  const bankNames = banks.map((bank) => bank.name).join(', ');

  const reportPeriod = getFormattedReportPeriod();
  const reportDueDate = await getFormattedReportDueDate();

  console.info(`Sending ${EMAIL_NAME} emails for ${reportPeriod} report period to banks: ${bankNames}`);

  for (const bank of banks) {
    await sendEmailForBank(bank, reportPeriod, reportDueDate);
  }

  console.info(`Finished sending ${EMAIL_NAME} emails`);
};

/**
 * @type {typeof import('../../types/scheduler-job').SchedulerJob}
 */
const sendReportingPeriodStartEmailsJob = {
  init: () => ({
    schedule: UTILISATION_REPORT_REPORTING_PERIOD_START_EMAIL_SCHEDULE,
    message: 'Email banks to notify that the GEF utilisation reporting period has started',
    task: sendEmails,
  }),
};

module.exports = sendReportingPeriodStartEmailsJob;
