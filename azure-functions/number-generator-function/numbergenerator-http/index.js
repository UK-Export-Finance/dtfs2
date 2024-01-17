const df = require('durable-functions');

const numberGeneratorHttp = async (context, req) => {
  console.info('⚡️ Invoking number generator DOF via Azure HTTP trigger');

  const client = df.getClient(context);
  const instanceId = await client.startNew(req.params.functionName, undefined, req.body);

  return client.createCheckStatusResponse(context.bindingData.req, instanceId);
};

module.exports = numberGeneratorHttp;
