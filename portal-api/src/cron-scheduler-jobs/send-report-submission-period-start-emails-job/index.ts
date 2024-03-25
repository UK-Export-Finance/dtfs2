import { CronSchedulerJob } from '@ukef/dtfs2-common';
import sendEmail from '../../external-api/send-email';
import EMAIL_TEMPLATE_IDS from '../../constants/email-template-ids';
import { getFormattedReportDueDate, sendEmailToAllBanksWhereReportNotReceived } from '../helpers/utilisation-report-helpers';

const { UTILISATION_REPORT_SUBMISSION_PERIOD_START_EMAIL_SCHEDULE } = process.env;

const EMAIL_DESCRIPTION = 'GEF utilisation report submission period start';

/**
 * Attempts to send the email to all banks
 */
const sendEmails = async () => {
  const reportDueDate = await getFormattedReportDueDate();

  await sendEmailToAllBanksWhereReportNotReceived({
    emailDescription: EMAIL_DESCRIPTION,
    sendEmailCallback: async (emailAddress, recipient, formattedReportPeriod) =>
      sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_SUBMISSION_PERIOD_START, emailAddress, {
        recipient,
        reportPeriod: formattedReportPeriod,
        reportDueDate,
      }),
  });
};

export const sendReportSubmissionPeriodStartEmailsJob: CronSchedulerJob = {
  cronExpression: UTILISATION_REPORT_SUBMISSION_PERIOD_START_EMAIL_SCHEDULE as string,
  description: 'Email banks to notify that the GEF utilisation report submission period has started',
  task: sendEmails,
};
