const sendEmail = require('../../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../../constants/email-template-ids');
const {
  getFormattedReportDueDate,
  getFormattedReportPeriod,
  sendEmailToAllBanksWhereReportNotReceived,
} = require('../helpers/utilisation-report-helpers');

const { UTILISATION_REPORT_SUBMISSION_PERIOD_START_EMAIL_SCHEDULE } = process.env;

const EMAIL_DESCRIPTION = 'GEF utilisation report submission period start';

/**
 * Attempts to send the email to all banks
 */
const sendEmails = async () => {
  const reportPeriod = getFormattedReportPeriod();
  const reportDueDate = await getFormattedReportDueDate();

  await sendEmailToAllBanksWhereReportNotReceived({
    emailDescription: EMAIL_DESCRIPTION,
    sendEmailCallback: async ({ emailAddress, recipient }) =>
      sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_SUBMISSION_PERIOD_START, emailAddress, {
        recipient,
        reportPeriod,
        reportDueDate,
      }),
  });
};

/**
 * @type {typeof import('../../../types/scheduler-job').SchedulerJob}
 */
const sendReportSubmissionPeriodStartEmailsJob = {
  init: () => ({
    schedule: UTILISATION_REPORT_SUBMISSION_PERIOD_START_EMAIL_SCHEDULE,
    message: 'Email banks to notify that the GEF utilisation report submission period has started',
    task: sendEmails,
  }),
};

module.exports = sendReportSubmissionPeriodStartEmailsJob;
