const api = require('../../src/v1/api');

jest.unmock('../../src/v1/api');

const mockResponses = {
  200: {
    status: 200,
    data: {},
  },
  404: {
    status: 404,
    response: {
      status: 404,
    },
  },
};

jest.mock('axios', () => jest.fn(({ method }) => {
  if (method === 'get') {
    return Promise.resolve(mockResponses['200']);
  }
}));

describe('api calls', () => {
  describe('findACBSIndustrySector lookup', () => {
    it('should return status code from industry sector lookup', async () => {
      const { status } = await api.findACBSIndustrySector(1234);
      expect(status).toEqual(200);
    });
  });
});
