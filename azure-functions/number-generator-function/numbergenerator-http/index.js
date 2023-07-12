/**
 * This code represents an HTTP-triggered Azure Function that starts a new instance of a Durable Function based on the provided function name
 * and request body data.
 * The response of the HTTP trigger includes a URL that can be used to check the status of the Durable Function instance.
 */
const df = require('durable-functions');

const numberGeneratorHttp = async (context, req) => {
  try {
    const client = df.getClient(context);
    const instanceId = await client.startNew(req.params.functionName, undefined, req.body);
    return client.createCheckStatusResponse(context.bindingData.req, instanceId);
  } catch (err) {
    console.error('Error calling number generator %s', err);
    return { err };
  }
};

module.exports = numberGeneratorHttp;
