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

module.exports = df.orchestrator(function* numbergenerator(context) {
  console.log('NUM GEN');
  // Replace "Hello" with the name of your Durable Activity Function.
  const num = yield context.df.callActivity('activity-get-number-from-generator');

  // returns ["Hello Tokyo!", "Hello Seattle!", "Hello London!"]
  return { num };
});
