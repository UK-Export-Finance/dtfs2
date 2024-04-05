import { format, isSameDay } from 'date-fns';
import { CronSchedulerJob, asString } from '@ukef/dtfs2-common';
import { SendEmailCallback, getReportDueDate, sendEmailToAllBanksWhereReportNotReceived } from '../helpers/utilisation-report-helpers';
import sendEmail from '../../external-api/send-email';
import EMAIL_TEMPLATE_IDS from '../../constants/email-template-ids';

const { UTILISATION_REPORT_DUE_EMAIL_SCHEDULE } = process.env;

const EMAIL_DESCRIPTION = 'GEF utilisation report due';

/**
 * Attempts to send the emails if the report for the current period is due today
 */
const sendEmailsOnReportDueDate = async () => {
  console.info(`Checking if ${EMAIL_DESCRIPTION} emails should be sent today`);

  const today = new Date();
  const reportDueDate = await getReportDueDate();
  const sendEmailCallback: SendEmailCallback = async (emailAddress, recipient, formattedReportPeriod) => {
    await sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_DUE_TODAY, emailAddress, {
      recipient,
      reportPeriod: formattedReportPeriod,
    });
  };

  if (isSameDay(today, reportDueDate)) {
    await sendEmailToAllBanksWhereReportNotReceived({
      emailDescription: EMAIL_DESCRIPTION,
      sendEmailCallback,
    });
  } else {
    const formattedReportDueDate = format(reportDueDate, 'dd-MMM-yy');
    console.info(`Not sending ${EMAIL_DESCRIPTION} emails - report is not due today (is/was due on ${formattedReportDueDate})`);
  }
};

export const sendReportDueEmailsJob: CronSchedulerJob = {
  cronExpression: asString(UTILISATION_REPORT_DUE_EMAIL_SCHEDULE, 'UTILISATION_REPORT_DUE_EMAIL_SCHEDULE'),
  description: 'Email banks to notify that this months GEF utilisation report has not yet been received and is due today',
  task: sendEmailsOnReportDueDate,
};
