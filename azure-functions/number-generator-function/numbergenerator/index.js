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

module.exports = df.orchestrator(function* numbergenerator(context) {
  // Replace "Hello" with the name of your Durable Activity Function.
  try {
    const deal = yield context.df.callActivityWithRetry('activity-get-number-from-generator', retryOptions);
    return { deal };
  } catch (error) {
    let errorMessageJson = error.message.replace('Activity function \'activity-get-number-from-generator\' failed:  Error:', '');

    try {
      errorMessageJson = JSON.parse(errorMessageJson);
    } catch (err) { return err; }

    return {
      num: 'ERROR_NUM_GENERATOR',
      error: errorMessageJson,
    };
  }

  // returns ["Hello Tokyo!", "Hello Seattle!", "Hello London!"]
});
