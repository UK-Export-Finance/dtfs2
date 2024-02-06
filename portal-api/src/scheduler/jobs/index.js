const sendReportDueEmailsJob = require('./send-report-due-emails-job');
const sendReportSubmissionPeriodStartEmailsJob = require('./send-report-submission-period-start-emails-job');
const sendReportOverdueEmailsJob = require('./send-report-overdue-emails-job');

/**
 * @type {typeof import('../../types/scheduler-job').SchedulerJob[]}
 */
module.exports = [sendReportDueEmailsJob, sendReportSubmissionPeriodStartEmailsJob, sendReportOverdueEmailsJob];
