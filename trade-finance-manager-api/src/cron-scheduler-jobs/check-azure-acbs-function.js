const defaultSchedule = '*/10 * * * *';
const schedule = process.env.AZURE_ACBS_FUNCTION_SCHEDULE || defaultSchedule;

const acbsController = require('../v1/controllers/acbs.controller');

/**
 * @type {import('@ukef/dtfs2-common').CronSchedulerJob}
 */
const checkAzureAcbsFunction = {
  cronExpression: schedule,
  description: 'Check Azure ACBS Function messages',
  task: acbsController.checkAzureAcbsFunction,
};

module.exports = { checkAzureAcbsFunction };
