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
  try {
    console.info('⚡️ Invoking number generator');

    if (!process.env.APIM_MDM_URL || !process.env.APIM_MDM_KEY || !process.env.APIM_MDM_VALUE) {
      console.log('===1');
      throw new Error('Missing environment variables');
    }

    if (!context.df.getInput()) {
      console.log('===2');
      throw new Error('Void input');
    }
    console.log('===3');
    const { entityType } = context.df.getInput();
    console.log('===4', entityType);

    if (entityType !== CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL
    && entityType !== CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY) {
      console.log('===5');
      throw new Error('Void entityType argument specified');
    }
    console.log('===5.5', entityType, retryOptions);
    const result = yield context.df.callActivityWithRetry(
      'activity-get-number-from-generator',
      retryOptions,
      {
        entityType,
      },
    );
  console.log('===5.7', result);
    return result;
  } catch (error) {
    console.error('Error while executing number generator DAF');
    return {
      num: 'ERROR_NUM_GENERATOR',
      error,
    };
  }
});
