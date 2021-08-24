const df = require('durable-functions');

const numberGeneratorHttp = async (context, req) => {
  try {
    return {
      status: 200,
      body: {
        a: 1,
      },
    };
    const client = df.getClient(context);
    const instanceId = await client.startNew(req.params.functionName, undefined, req.body);
    return client.createCheckStatusResponse(context.bindingData.req, instanceId);
  } catch (err) {
    console.log('GENERATOR ERROR', JSON.stringify(err));
    return { err };
  }
};

module.exports = numberGeneratorHttp;
