const sendReportingPeriodStartEmailsJob = require('./send-reporting-period-start-emails-job');

/**
 * @type {typeof import('../types/scheduler-job').SchedulerJob[]}
 */
module.exports = [sendReportingPeriodStartEmailsJob];
