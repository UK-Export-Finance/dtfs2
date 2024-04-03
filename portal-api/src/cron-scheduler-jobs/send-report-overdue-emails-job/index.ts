import { isSameDay, format } from 'date-fns';
import { CronSchedulerJob, asString } from '@ukef/dtfs2-common';
import {
  getReportOverdueChaserDate,
  getFormattedReportDueDate,
  sendEmailToAllBanksWhereReportNotReceived,
  SendEmailCallback,
} from '../helpers/utilisation-report-helpers';
import sendEmail from '../../external-api/send-email';
import EMAIL_TEMPLATE_IDS from '../../constants/email-template-ids';

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
    const reportDueDate = await getFormattedReportDueDate();

    const sendEmailCallback: SendEmailCallback = async (emailAddress, recipient, formattedReportPeriod) => {
      await sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_OVERDUE, emailAddress, {
        recipient,
        reportPeriod: formattedReportPeriod,
        reportDueDate,
      });
    };

    await sendEmailToAllBanksWhereReportNotReceived({
      emailDescription: EMAIL_DESCRIPTION,
      sendEmailCallback,
    });
  } else {
    const formattedReportOverdueChaserDate = format(reportOverdueChaserDate, 'dd-MMM-yy');
    console.info(`Not sending ${EMAIL_DESCRIPTION} emails - report overdue chaser is not due today (is/was due on ${formattedReportOverdueChaserDate})`);
  }
};

export const sendReportOverdueEmailsJob: CronSchedulerJob = {
  cronExpression: asString(UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE, 'UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE'),
  description: 'Email banks to notify that this months GEF utilisation report is overdue',
  task: sendEmailsOnReportOverdueChaserDate,
};
