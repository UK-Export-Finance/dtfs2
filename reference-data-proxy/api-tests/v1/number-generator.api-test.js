const axios = require('axios');
const app = require('../../src/createApp');
const { get } = require('../api')(app);

const mockId = '0030007215';

const mockResponses = {
  numberGenerator: {
    status: 201,
    data: {
      id: 20018971,
      maskedId: mockId,
      numberTypeId: 1,
      createdBy: 'Portal v2/TFM',
      createdDatetime: '2020-12-16T15:12:28.13Z',
      requestingSystem: 'Portal v2/TFM',
    }
  },
  acbs: {
    status: 404,
    data: {
      id: mockId,
    },
  },
};

jest.mock('axios', () => jest.fn((args) => {
  const { method, url } = args;

  if (method === 'post') {
    if (url === process.env.MULESOFT_API_NUMBER_GENERATOR_URL) {
      return Promise.resolve(mockResponses.numberGenerator);
    }
  }

  if (method === 'get') {
    if (url === `${process.env.MULESOFT_API_ACBS_DEAL_URL}/${mockId}`) {
      return Promise.resolve(mockResponses.acbs);
    }
  }

  if (method === 'get') {
    if (url === `${process.env.MULESOFT_API_ACBS_FACILITY_URL}/${mockId}`) {
      return Promise.resolve(mockResponses.acbs);
    }
  }
}));

describe('/number-generator', () => {
  describe('GET /v1/number-generator/:entityType', () => {
    describe('when an invalid entityType is provided', () => {
      it('should return 400', async () => {

        const { status, text } = await get('/number-generator/something');

        expect(status).toEqual(400);
        expect(text).toEqual('Invalid entity type - must be deal or facility');
      });
    });

    describe('when entityType is `deal`', () => {
      it('should return maskedId value', async () => {
        const { status, body } = await get('/number-generator/deal');

        expect(status).toEqual(200);
        expect(body).toEqual({
          id: mockResponses.numberGenerator.data.maskedId,
        });
      });
    });

    describe('when entityType is `facility`', () => {
      it('should return maskedId value', async () => {
        const { status, body } = await get('/number-generator/facility');

        expect(status).toEqual(200);
        expect(body).toEqual({
          id: mockResponses.numberGenerator.data.maskedId,
        });
      });
    });
  });
});
