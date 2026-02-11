/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { app } from '../../server/createApp';
import { api } from '../api';

const { APIM_MDM_URL } = process.env;
const { get } = api(app);

const mockResponse = {
  status: 200,
  data: {
    exposurePeriod: 13,
  },
};

const mockStartDate = '2017-07-04';
const mockEndDate = '2018-07-04';

// Mock Axios
const axiosMock = new MockAdapter(axios);
axiosMock
  .onGet(`${APIM_MDM_URL}v1/exposure-period?startdate=${mockStartDate}&enddate=${mockEndDate}&productgroup=BS`)
  .reply(HttpStatusCode.Ok, mockResponse.data);
axiosMock
  .onGet(`${APIM_MDM_URL}v1/exposure-period?startdate=${mockStartDate}&enddate=${mockEndDate}&productgroup=EW`)
  .reply(HttpStatusCode.Ok, mockResponse.data);

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

    const invalidDateTestCases = [
      ['12-52-21041', mockEndDate],
      ['127.0.0.1', mockEndDate],
      ['{}', mockEndDate],
      ['[]', mockEndDate],
      [mockStartDate, '12-52-21041'],
      [mockStartDate, '127.0.0.1'],
      [mockStartDate, '{}'],
      [mockStartDate, '[]'],
    ];

    describe('when dates are invalid', () => {
      test.each(invalidDateTestCases)('returns a 400 if you provide invalid dates %s, %s', async (startDate, endDate) => {
        const { status, body } = await get(`/exposure-period/${startDate}/${endDate}/Loan`);

        expect(status).toEqual(400);
        expect(body).toMatchObject({ data: 'Invalid date provided', status: 400 });
      });
    });
  });
});
