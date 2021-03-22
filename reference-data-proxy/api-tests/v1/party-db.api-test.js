const app = require('../../src/createApp');
const { get } = require('../api')(app);

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

describe('/partyDB lookup', () => {
  describe('GET /v1/party-db/:companyRegNo', () => {
    it('should return status code from successful party lookup', async () => {
      const { status } = await get('/party-db/1234');
      expect(status).toEqual(200);
    });
  });
});
