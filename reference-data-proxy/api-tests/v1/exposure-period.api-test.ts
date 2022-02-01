import { app } from '../../src/createApp';
const { get } = require('../api')(app);

const mockResponse = {
  status: 200,
  data: {
    exposurePeriod: 13,
  },
};

const mockStartDate = '2017-07-04';
const mockEndDate = '2018-07-04';

jest.mock('axios', () =>
  jest.fn((args: any) => {
    const { url } = args;

    if (url === `${process.env.MULESOFT_API_EXPOSURE_PERIOD_URL}?startdate=${mockStartDate}&enddate=${mockEndDate}&productgroup=BS`) {
      return Promise.resolve(mockResponse);
    }

    if (url === `${process.env.MULESOFT_API_EXPOSURE_PERIOD_URL}?startdate=${mockStartDate}&enddate=${mockEndDate}&productgroup=EW`) {
      return Promise.resolve(mockResponse);
    }
  }),
);

describe('/exposure-period', () => {
  describe('GET /v1/exposure-period/:startDate/:endDate/:facilityType', () => {
    describe('when facilityType is `bond`', () => {
      it('should return response.data.exposurePeriod as exposurePeriodInMonths', async () => {
        const { status, body } = await get(`/exposure-period/${mockStartDate}/${mockEndDate}/Bond`);
        expect(status).toEqual(200);
        expect(body).toEqual({
          exposurePeriodInMonths: mockResponse.data.exposurePeriod,
        });
      });
    });

    describe('when facilityType is `loan`', () => {
      it('should return response.data.exposurePeriod as exposurePeriodInMonths', async () => {
        const { status, body } = await get(`/exposure-period/${mockStartDate}/${mockEndDate}/Loan`);
        expect(status).toEqual(200);
        expect(body).toEqual({
          exposurePeriodInMonths: mockResponse.data.exposurePeriod,
        });
      });
    });
  });
});
