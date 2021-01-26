const axios = require('axios');
const app = require('../../src/createApp');
const { get } = require('../api')(app);

const mockResponses = {
  '200': {
    status: 200,
    data: {},
  },
  '404': {
    status: 404,
    response: {
      status: 404,
    },
  }
};

jest.mock('axios', () => jest.fn((args) => {
  const { method, url } = args;
  if (method === 'get') {
    if (url === `${process.env.MULESOFT_API_ACBS_DEAL_URL}/1234`) {
      return Promise.resolve(mockResponses['200']);
    } else if (url === `${process.env.MULESOFT_API_ACBS_FACILITY_URL}/1234`) {
      return Promise.resolve(mockResponses['200']);
    } else if (url === `${process.env.MULESOFT_API_ACBS_DEAL_URL}/5678`) {
      return Promise.reject(mockResponses['404']);
    } else if (url === `${process.env.MULESOFT_API_ACBS_FACILITY_URL}/5678`) {
      return Promise.reject(mockResponses['404']);
    }
  }
}));

describe('/acbs', () => {
  describe('GET /v1/acbs/:dealId', () => {
    it('should return status code from ACBS response for a deal', async () => {
      const { status } = await get('/acbs/deal/1234');
      expect(status).toEqual(200);
    });

    it('should return status code from ACBS response for a facility', async () => {
      const { status } = await get('/acbs/facility/1234');
      expect(status).toEqual(200);
    });

    it('should return 404 for a deal', async () => {
      const { status } = await get('/acbs/deal/5678');
      expect(status).toEqual(404);
    });

    it('should return 404 for a facility', async () => {
      const { status } = await get('/acbs/facility/5678');
      expect(status).toEqual(404);
    });

    it('should return 500 when entityType is not `deal` or `facility`', async () => {
      const { status } = await get('/acbs/test/1234');
      expect(status).toEqual(500);
    });
  });
});
