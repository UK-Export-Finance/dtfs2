const axios = require('axios');
const app = require('../../src/createApp');
const { get } = require('../api')(app);

const mockDealId = '0030007215';

const mockResponses = {
  numberGenerator: {
    status: 201,
    data: {
      id: 20018971,
      maskedId: mockDealId,
      numberTypeId: 1,
      createdBy: 'Portal v2/TFM',
      createdDatetime: '2020-12-16T15:12:28.13Z',
      requestingSystem: 'Portal v2/TFM',
    }
  },
  acbs: {
    200: {
      status: 200,
      data: {
        id: mockDealId,
      },
    },
    404: {
      status: 404,
      data: {
        id: mockDealId,
      },
    }
  },
};

let acbsCallCount;

jest.mock('axios', () => {
  let getCallCount = 0;

  return jest.fn((args) => {
    const { method, url } = args;

    if (method === 'post') {
      if (url === process.env.MULESOFT_API_NUMBER_GENERATOR_URL) {
        return Promise.resolve(mockResponses.numberGenerator);
      }
    }

    if (method === 'get') {
      getCallCount = getCallCount + 1;
      acbsCallCount = getCallCount;

      if (url === `${process.env.MULESOFT_API_ACBS_DEAL_URL}/${mockDealId}`) {
        if (getCallCount === 3) {
          return Promise.resolve(mockResponses.acbs['404']);
        } else {
          return Promise.resolve(mockResponses.acbs['200']);
        }
      }
    }
})});

describe('/number-generator - retries', () => {
  describe('GET /v1/number-generator/:entityType', () => {
    it('should keep calling number-generator API and ACBS API with new ids until an unused ID is returned', async () => {
      const { status, body } = await get('/number-generator/deal');

      expect(acbsCallCount).toEqual(3);
      expect(status).toEqual(200);
      expect(body).toEqual({
        id: mockResponses.numberGenerator.data.maskedId,
      });
    });
  });
});
