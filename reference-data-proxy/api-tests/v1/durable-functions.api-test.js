const durableFunctionsLogController = require('../../src/v1/controllers/durable-functions-log.controller');

const mockInsertOne = jest.fn();
jest.mock('../../src/drivers/db-client', () => ({
  getCollection: jest.fn(() => ({
    insertOne: mockInsertOne,
  })),
}));

describe('/durable-functions log', () => {
  it('should add to the logs', async () => {
    const params = {
      type: 'NUMBER_GENERATOR',
      data: {
        a: 1,
      },
    };

    await durableFunctionsLogController.addDurableFunctionLog(params);

    expect(mockInsertOne).toHaveBeenCalledWith({
      status: 'Running',
      submittedDate: expect.any(String),
      type: params.type,
      ...params.data,
    });
  });
});
