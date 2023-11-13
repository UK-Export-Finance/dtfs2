const { format, isSameDay } = require('date-fns');
const { getReportDueDate, getReportPeriodMonthAndYear, getFormattedReportPeriod, getEmailRecipient } = require('../helpers/utilisation-report-helpers');
const api = require('../../../v1/api');
const { hasValue, isValidEmail } = require('../../../utils/string');
const sendEmail = require('../../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../../constants/email-template-ids');

const { UTILISATION_REPORT_DUE_EMAIL_SCHEDULE } = process.env;

const EMAIL_NAME = 'GEF utilisation report due';

/**
 * Sends the email to the specified bank when a valid payment officer team email is present
 * @param bank {object} - the bank to send the email to
 * @param reportPeriod {string} - the formatted reporting period that will appear in the email
 */
const sendEmailForBank = async (bank, reportPeriod) => {
  const { name: bankName, paymentOfficerTeam } = bank;
  const paymentOfficerTeamEmail = paymentOfficerTeam?.email;

  try {
    if (!hasValue(paymentOfficerTeamEmail)) {
      console.warn(`Not sending ${EMAIL_NAME} email to '${bankName}' - no payment officer team email set`);
    } else if (!isValidEmail(paymentOfficerTeamEmail)) {
      console.error(`Failed to send ${EMAIL_NAME} email to '${bankName}' - invalid payment officer team email '${paymentOfficerTeamEmail}'`);
    } else {
      await sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_DUE_TODAY, paymentOfficerTeamEmail, {
        recipient: getEmailRecipient(paymentOfficerTeam, bankName),
        reportPeriod,
      });
      console.info(`Successfully sent ${EMAIL_NAME} email to '${bankName}'`);
    }
  } catch (error) {
    console.error(`Failed to send ${EMAIL_NAME} for bank '${bankName}':`, error);
  }
};

/**
 * Checks if a utilisation report has already been submitted by the specified bank for the current reporting period
 * @param bank {object} - the bank to check
 * @returns {Promise<boolean>}
 */
const getIsReportSubmitted = async (bank) => {
  // TODO FN-1163 - check how this endpoint has been updated
  const reportsResponse = await api.getUtilisationReports(bank.id);

  if (reportsResponse?.status !== 200) {
    const error = reportsResponse?.data ?? 'unknown error';
    throw new Error(`Failed to get utilisation reports for ${bank.name} (bank ID: ${bank.id}): %s`, error);
  }

  const reportPeriod = getReportPeriodMonthAndYear();
  return reportsResponse.data.some((report) => report.month === reportPeriod.month && report.year === reportPeriod.year);
};

/**
 * Attempts to send the email to all banks that have not already submitted a report for the current report period.
 */
const sendEmails = async () => {
  console.info(`Report is due today - attempting to send ${EMAIL_NAME} emails`);

  const banks = await api.getAllBanks();
  const reportPeriod = getFormattedReportPeriod();

  for (const bank of banks) {
    const { name: bankName, id: bankId } = bank;

    try {
      const isReportSubmitted = await getIsReportSubmitted(bank);

      if (isReportSubmitted) {
        console.info(
          `Not sending ${EMAIL_NAME} email to ${bankName} (bank ID: ${bankId}) - report has already been submitted for ${reportPeriod} report period`,
        );
      } else {
        await sendEmailForBank(bank, reportPeriod);
        console.info(`Successfully sent ${EMAIL_NAME} to ${bankName} (bank ID: ${bankId})`);
      }
    } catch (error) {
      console.error(`Failed to send ${EMAIL_NAME} for ${bankName} (bank ID: ${bankId}): %s`, error);
    }
  }
};

/**
 * Attempts to send the emails if the report for the current period is due today
 */
const sendEmailsOnReportDueDate = async () => {
  console.info(`Checking if ${EMAIL_NAME} emails should be sent today`);

  const today = new Date();
  const reportDueDate = await getReportDueDate();

  if (isSameDay(today, reportDueDate)) {
    await sendEmails();
  } else {
    const formattedReportDueDate = format(reportDueDate, 'dd-MMM-yy');
    console.info(`Not sending ${EMAIL_NAME} emails - report is not due today (is/was due on ${formattedReportDueDate})`);
  }
};

/**
 * @type {typeof import('../../types/scheduler-job').SchedulerJob}
 */
const sendReportDueEmailsJob = {
  init: () => ({
    schedule: UTILISATION_REPORT_DUE_EMAIL_SCHEDULE,
    message: 'Email banks to notify that this months GEF utilisation report has not yet been received and is due today',
    task: sendEmailsOnReportDueDate,
  }),
};

module.exports = sendReportDueEmailsJob;
