const dotenv = require('dotenv');

dotenv.config();

const schedule = process.env.AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE;

const numberGeneratorController = require('../../v1/controllers/number-generator.controller');

/**
 * @type {import('@ukef/dtfs2-common').SchedulerJob}
 */
const checkAzureNumberGeneratorFunction = {
  cronExpression: schedule,
  description: 'Check Azure Number Generator Function messages',
  task: numberGeneratorController.checkAzureNumberGeneratorFunction(),
};

module.exports = { checkAzureNumberGeneratorFunction };
