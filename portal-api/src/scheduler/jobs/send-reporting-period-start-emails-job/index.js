const api = require('../../../v1/api');
const sendEmail = require('../../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../../constants/email-template-ids');
const { hasValue, isValidEmail } = require('../../../utils/string');
const { getReportPeriod, getReportDueDate } = require('./helpers');

const FIRST_OF_MONTH_AT_7_AM_CRON = '0 7 1 * *';
const SCHEDULE = process.env.PORTAL_REPORTING_PERIOD_START_EMAIL_SCHEDULE ?? FIRST_OF_MONTH_AT_7_AM_CRON;

const DEFAULT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = 10;
const DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH =
  process.env.PORTAL_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH ?? DEFAULT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH;

const EMAIL_NAME = 'GEF utilisation reporting period start';

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
        recipient: paymentOfficerTeam.teamName,
        reportPeriod,
        reportDueDate,
      });
      console.info(`Successfully sent ${EMAIL_NAME} email to '${bankName}'`);
    }
  } catch (error) {
    console.error(`Failed to send ${EMAIL_NAME} for bank '${bankName}':`, error);
  }
};

const sendEmails = async () => {
  console.info(`Attempting to send ${EMAIL_NAME} emails`);

  const banks = await api.getAllBanks();
  const bankNames = banks.map((bank) => bank.name).join(', ');

  const reportPeriod = getReportPeriod();
  const reportDueDate = await getReportDueDate({
    businessDaysFromStartOfMonth: DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH,
  });

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
    schedule: SCHEDULE,
    message: 'Email banks to notify that the GEF utilisation reporting period has started',
    task: sendEmails,
  }),
};

module.exports = sendReportingPeriodStartEmailsJob;
