const df = require('durable-functions');
const httpFunction = require('./index');
const context = require('../test-helpers/defaultContext');

test('Http trigger should return known text', async () => {
  const request = {
    params: {
      functionName: 'mockDurableFunction',
    },
    body: {
      mock: 1,
    },
  };

  await httpFunction(context, request);

  expect(df.mockClient.startNew).toHaveBeenCalledWith(request.params.functionName, { input: request.body });
  expect(df.mockClient.createCheckStatusResponse).toHaveBeenCalledWith(context.bindingData.req, 'mockInstanceId');
});
