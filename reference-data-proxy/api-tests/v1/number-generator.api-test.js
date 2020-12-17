const axios = require('axios');
const app = require('../../src/createApp');
const { get } = require('../api')(app);

const mockResponse = {
  status: 201,
  data: {
    id: 20018971,
    maskedId: '0030007215',
    numberTypeId: 1,
    createdBy: 'Portal v2/TFM',
    createdDatetime: '2020-12-16T15:12:28.13Z',
    requestingSystem: 'Portal v2/TFM',
  }
};

jest.mock('axios', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('/number-generator', () => {
  describe('GET /v1/number-generator/:numberType', () => {
    describe('when an invalid numberType is provided', () => {
      it('should return 400', async () => {
        
        const { status, text } = await get('/number-generator/10');

        expect(status).toEqual(400);
        expect(text).toEqual('Invalid number type.');
      });
    });

    it('should return status with maskedId value', async () => {
      const { status, body } = await get('/number-generator/1');

      expect(status).toEqual(mockResponse.status);
      expect(body).toEqual({
        id: mockResponse.data.maskedId
      });
    });
  });
});
