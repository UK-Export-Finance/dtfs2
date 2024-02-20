import { SchedulerJob } from '@ukef/dtfs2-common';
import { sendReportDueEmailsJob } from './send-report-due-emails-job';
import { sendReportSubmissionPeriodStartEmailsJob } from './send-report-submission-period-start-emails-job';
import { sendReportOverdueEmailsJob } from './send-report-overdue-emails-job';

export const jobs: SchedulerJob[] = [sendReportDueEmailsJob, sendReportSubmissionPeriodStartEmailsJob, sendReportOverdueEmailsJob];
