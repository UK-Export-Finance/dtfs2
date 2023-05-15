/*
 * This function is not intended to be invoked directly. Instead it will be
* triggered by an HTTP starter function.
 *
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *    function app in Kudu
 */

const df = require('durable-functions');
const retryOptions = require('../helpers/retryOptions');
const CONSTANTS = require('../constants');

module.exports = df.orchestrator(function* numbergenerator(context) {
  console.info('⚡️ Invoking number generator');

  if (!process.env.APIM_MDM_URL || !process.env.APIM_MDM_KEY || !process.env.APIM_MDM_VALUE) {
    throw new Error('🚩 Missing environment variables');
  }

  if (!context.df.getInput()) {
    throw new Error('🚩 Void input');
  }

  const { entityType } = context.df.getInput();

  if (entityType !== CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL
    && entityType !== CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY) {
    throw new Error('🚩 Void entityType argument specified');
  }

  try {
    const result = yield context.df.callActivityWithRetry(
      'activity-get-number-from-generator',
      retryOptions,
      {
        entityType,
      },
    );

    return result;
  } catch (error) {
    console.error('🚩 Error while executing number generator DAF');
    return {
      num: 'ERROR_NUM_GENERATOR',
      error,
    };
  }
});
