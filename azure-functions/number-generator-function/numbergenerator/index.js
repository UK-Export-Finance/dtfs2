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
  const { dealId, facilities = [] } = context.df.getInput();

  if (!dealId) {
    return {
      num: 'ERROR_NUM_GENERATOR',
      error: 'No dealId provided',
    };
  }

  try {
    const dealTask = context.df.callActivityWithRetry(
      'activity-get-number-from-generator',
      retryOptions,
      {
        id: dealId,
        entityType: CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL,
      },
    );

    const facilityTasks = facilities.map(
      (id) => context.df.callActivityWithRetry(
        'activity-get-number-from-generator',
        retryOptions,
        {
          id,
          entityType: CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY,
        },
      ),
    );

    yield context.df.Task.all([dealTask, ...facilityTasks]);

    return {
      deal: dealTask.result,
      facilityTasks: facilityTasks.map(({ result }) => result),
    };
  } catch (error) {
    /*
      Regex to extract JSON string from error message
        Error msg is in form of:
          'context.df.Task.all() encountered the below error messages:\n\nName: Error\nMessage: Activity function \'activity-get-number-from-generator\' failed:  Error: {"status":401,"statusText":"Unauthorized","data":{"error":"Invalid Client"},"requestConfig":{"method":"post","url":"https://dev-ukef-tf-ea-v1.uk-e1.cloudhub.io/api/v1/numbers","auth":{"password":"9be2961393e84a31A1716b71EE0d1573"},"headers":{"Content-Type":"application/json"},"data":[{"numberTypeId":1,"createdBy":"Portal v2/TFM","requestingSystem":"Portal v2/TFM"}]},"date":"2021-08-04T11:46:32.264Z"}\nStackTrace: Error: Activity function \'activity-get-number-from-generator\' failed:  Error: {"status":401,"statusText":"Unauthorized","data":{"error":"Invalid Client"},"requestConfig":{"method":"post","url":"https://dev-ukef-tf-ea-v1.uk-e1.cloudhub.io/api/v1/numbers","auth":{"password":"9be2961393e84a31A1716b71EE0d1573"},"headers":{"Content-Type":"application/json"},"data":[{"numberTypeId":1,"createdBy":"Portal v2/TFM","requestingSystem":"Portal v2/TFM"}]},"date":"2021-08-04T11:46:32.264Z"}\n    at DurableOrchestrationContext.callActivityWithRetry (/home/site/wwwroot/node_modules/durable-functions/lib/src/durableorchestrationcontext.js:143:148)\n
        regex matches
          'Error\nMessage: Activity function \'activity-get-number-from-generator\' failed:  Error: {"status":401,"statusText":"Unauthorized","data":{"error":"Invalid Client"},"requestConfig":{"method":"post","url":"https://dev-ukef-tf-ea-v1.uk-e1.cloudhub.io/api/v1/numbers","auth":{"password":"9be2961393e84a31A1716b71EE0d1573"},"headers":{"Content-Type":"application/json"},"data":[{"numberTypeId":1,"createdBy":"Portal v2/TFM","requestingSystem":"Portal v2/TFM"}]},"date":"2021-08-04T11:46:32.264Z"}\n'
        and extracts the JSON string
          '{"status":401,"statusText":"Unauthorized","data":{"error":"Invalid Client"},"requestConfig":{"method":"post","url":"https://dev-ukef-tf-ea-v1.uk-e1.cloudhub.io/api/v1/numbers","auth":{"password":"9be2961393e84a31A1716b71EE0d1573"},"headers":{"Content-Type":"application/json"},"data":[{"numberTypeId":1,"createdBy":"Portal v2/TFM","requestingSystem":"Portal v2/TFM"}]},"date":"2021-08-04T11:46:32.264Z"}'
    */
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
