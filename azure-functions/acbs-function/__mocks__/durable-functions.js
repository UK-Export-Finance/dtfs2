const actualDurableFunctions = jest.requireActual('durable-functions');

const mockClient = {
  startNew: jest.fn(() => 'mockInstanceId'),
  createCheckStatusResponse: jest.fn(),
};

module.exports = {
  ...actualDurableFunctions,
  getClient: jest.fn(() => mockClient),
};

module.exports.mockClient = mockClient;
