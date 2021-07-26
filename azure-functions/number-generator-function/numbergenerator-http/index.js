const df = require('durable-functions');

const numberGeneratorHttp = async (context, req) => {
  try {
    const client = df.getClient(context);
    const instanceId = await client.startNew(req.params.functionName, undefined, req.body);
    return client.createCheckStatusResponse(context.bindingData.req, instanceId);
  } catch (err) {
    return { err };
  }
};

module.exports = numberGeneratorHttp;
