const df = require('durable-functions');

const acbsHttp = async (context, req) => {
  console.info('⚡️ Invoking ACBS DOF via Azure HTTP trigger');

  const client = df.getClient(context);
  const instanceId = await client.startNew(req.params.functionName, undefined, req.body);

  return client.createCheckStatusResponse(context.bindingData.req, instanceId);
};

module.exports = acbsHttp;
