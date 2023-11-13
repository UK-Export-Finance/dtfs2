const sendReportDueEmailsJob = require('./send-report-due-emails-job');
const sendReportingPeriodStartEmailsJob = require('./send-reporting-period-start-emails-job');

/**
 * @type {typeof import('../types/scheduler-job').SchedulerJob[]}
 */
module.exports = [sendReportDueEmailsJob, sendReportingPeriodStartEmailsJob];
