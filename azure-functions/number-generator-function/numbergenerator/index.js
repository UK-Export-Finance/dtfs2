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
    console.error('🚩 Missing environment variables');
  }

  const { entityType } = context.df.getInput();

  if (entityType !== CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL
    && entityType !== CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY) {
    return {
      num: 'ERROR_NUM_GENERATOR',
      error: 'No dealId provided',
    };
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
    console.error('Azure functions - error calling Number Generator ActivityWithRetry');
    const errorList = [...error.message.matchAll(/Error: ({(?:(?!\\n).)*})/g)];

    // Attempt to parse each error message to return as JSON
    const errorMessageJson = errorList.map((err) => {
      const errStr = err[1];
      try {
        const errObj = JSON.parse(errStr);
        return errObj;
      } catch (parseErr) { return errStr; }
    });

    return {
      num: 'ERROR_NUM_GENERATOR',
      error: errorMessageJson,
    };
  }
});
