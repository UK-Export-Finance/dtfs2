const { isSameDay, format } = require('date-fns');
const {
  getFormattedReportPeriod,
  getReportOverdueChaserDate,
  getFormattedReportDueDate,
  sendEmailToAllBanksWhereReportNotReceived,
} = require('../helpers/utilisation-report-helpers');
const sendEmail = require('../../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../../constants/email-template-ids');

const { UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE } = process.env;

const EMAIL_DESCRIPTION = 'GEF utilisation report overdue';

/**
 * Attempts to send the emails if the report for the current period is overdue
 * a number of business days (the 'chaser date') after the original due date
 */
const sendEmailsOnReportOverdueChaserDate = async () => {
  console.info(`Checking if ${EMAIL_DESCRIPTION} emails should be sent today`);

  const today = new Date();
  const reportOverdueChaserDate = await getReportOverdueChaserDate();

  if (isSameDay(today, reportOverdueChaserDate)) {
    const reportPeriod = getFormattedReportPeriod();
    const reportDueDate = await getFormattedReportDueDate();

    await sendEmailToAllBanksWhereReportNotReceived({
      emailDescription: EMAIL_DESCRIPTION,
      sendEmailCallback: async ({ emailAddress, recipient }) =>
        sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_OVERDUE, emailAddress, {
          recipient,
          reportPeriod,
          reportDueDate,
        }),
    });
  } else {
    const formattedReportOverdueChaserDate = format(reportOverdueChaserDate, 'dd-MMM-yy');
    console.info(`Not sending ${EMAIL_DESCRIPTION} emails - report overdue chaser is not due today (is/was due on ${formattedReportOverdueChaserDate})`);
  }
};

/**
 * @type {import('@ukef/dtfs2-common').SchedulerJob}
 */
const sendReportOverdueEmailsJob = {
  cronExpression: UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE,
  description: 'Email banks to notify that this months GEF utilisation report is overdue',
  task: sendEmailsOnReportOverdueChaserDate,
};

module.exports = { sendReportOverdueEmailsJob };
