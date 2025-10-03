const df = require('durable-functions');

/**
 * Defines an HTTP trigger for invoking the ACBS DOF with GET and POST methods.
 * Route is set to 'orchestrators/{orchestratorName}' with extra inputs including the durable client.
 * Handles the request by starting a new orchestration instance with the provided input and returns a check status response.
 * Upon a successfull request execution, HTTP trigger function will return `202 Accepted`: The specified orchestrator function was scheduled to start running. The Location response header contains a URL for polling the orchestration status.
 *
 * Guidance: https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-http-api
 *
 * This function is an HTTP trigger for invoking the ACBS DOF with GET and POST methods.
 * It logs the request URL and method, extracts the HTTP body as input, and starts a new orchestration instance with the provided input.
 * It then returns a check status response for the started orchestration instance.
 *
 * @param {object} request - The HTTP request object, containing the URL, method, and body of the request.
 * @param {object} client - The durable client used to start a new orchestration instance and create a check status response.
 * @returns {Promise<object>} - A check status response for the started orchestration instance.
 */

const handler = async (request, client) => {
  console.info('⚡️ Invoking ACBS DOF using HTTP trigger at %s with HTTP %s method.', request.url, request.method);

  // HTTP body
  const input = await request.json();
  // Orchestration instance ID
  const instanceId = await client.startNew(request.params.orchestratorName, { input });

  return client.createCheckStatusResponse(request, instanceId);
};

df.app.client.http('acbs-http', {
  methods: ['GET', 'POST'],
  route: 'orchestrators/{orchestratorName}',
  extraInputs: [df.input.durableClient()],
  handler,
});

module.exports = handler;
