const { format, isSameDay } = require('date-fns');
const { getReportDueDate, getFormattedReportPeriod, sendEmailToAllBanksWhereReportNotReceived } = require('../helpers/utilisation-report-helpers');
const sendEmail = require('../../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../../constants/email-template-ids');

const { UTILISATION_REPORT_DUE_EMAIL_SCHEDULE } = process.env;

const EMAIL_DESCRIPTION = 'GEF utilisation report due';

/**
 * Attempts to send the emails if the report for the current period is due today
 */
const sendEmailsOnReportDueDate = async () => {
  console.info(`Checking if ${EMAIL_DESCRIPTION} emails should be sent today`);

  const today = new Date();
  const reportDueDate = await getReportDueDate();

  if (isSameDay(today, reportDueDate)) {
    const reportPeriod = getFormattedReportPeriod();

    await sendEmailToAllBanksWhereReportNotReceived({
      emailDescription: EMAIL_DESCRIPTION,
      sendEmailCallback: async ({ emailAddress, recipient }) =>
        sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_DUE_TODAY, emailAddress, {
          recipient,
          reportPeriod,
        }),
    });
  } else {
    const formattedReportDueDate = format(reportDueDate, 'dd-MMM-yy');
    console.info(`Not sending ${EMAIL_DESCRIPTION} emails - report is not due today (is/was due on ${formattedReportDueDate})`);
  }
};

/**
 * @type {typeof import('../../../types/scheduler-job').SchedulerJob}
 */
const sendReportDueEmailsJob = {
  init: () => ({
    schedule: UTILISATION_REPORT_DUE_EMAIL_SCHEDULE,
    message: 'Email banks to notify that this months GEF utilisation report has not yet been received and is due today',
    task: sendEmailsOnReportDueDate,
  }),
};

module.exports = sendReportDueEmailsJob;
