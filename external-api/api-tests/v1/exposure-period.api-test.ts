import { app } from '../../src/createApp';
import { api } from '../api';

const { get } = api(app);

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

    if (url === `${process.env.APIM_MDM_URL}exposure-period?startdate=${mockStartDate}&enddate=${mockEndDate}&productgroup=BS`) {
      return Promise.resolve(mockResponse);
    }

    if (url === `${process.env.APIM_MDM_URL}exposure-period?startdate=${mockStartDate}&enddate=${mockEndDate}&productgroup=EW`) {
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

    describe('when dates are invalid', () => {
      it('returns a 400 if you provide an invalid start date', async () => {
        const { status, body } = await get(`/exposure-period/12-52-21041/${mockEndDate}/Loan`);
  
        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });
  
      it('returns a 400 if you provide a malicious start date', async () => {
        const { status, body } = await get(`/exposure-period/127.0.0.1/${mockEndDate}/Loan`);
  
        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });
  
      it('returns a 400 if you provide an object as the start date', async () => {
        const { status, body } = await get(`/exposure-period/{}/${mockEndDate}/Loan`);
  
        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });
  
      it('returns a 400 if you provide an array as the start date', async () => {
        const { status, body } = await get(`/exposure-period/[]/${mockEndDate}/Loan`);

        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });

      it('returns a 400 if you provide an invalid end date', async () => {
        const { status, body } = await get(`/exposure-period/${mockStartDate}/12-52-21041/Loan`);
  
        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });
  
      it('returns a 400 if you provide a malicious end date', async () => {
        const { status, body } = await get(`/exposure-period/${mockStartDate}/127.0.0.1/Loan`);
  
        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });
  
      it('returns a 400 if you provide an object as the end date', async () => {
        const { status, body } = await get(`/exposure-period/${mockStartDate}/{}/Loan`);
  
        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });
  
      it('returns a 400 if you provide an array as the end date', async () => {
        const { status, body } = await get(`/exposure-period/${mockStartDate}/[]/Loan`);

        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });
    });
  });
});
