const mockClient = {
  startNew: jest.fn(() => 'mockInstanceId'),
  createCheckStatusResponse: jest.fn(),
};

module.exports = {
  getClient: jest.fn(() => mockClient),
};

module.exports.mockClient = mockClient;
