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
import axios from 'axios';
import { app } from '../../server/createApp';
import { api } from '../api';
import premiumScheduleController from '../../server/v1/controllers/premium-schedule.controller';
import { mockResponsePremiumSchedule } from '../test-mocks/premium-schedule';

const { getWithRequestBody } = api(app);

describe('/premium-schedule', () => {
  const payload = {
    premiumTypeId: '2',
    premiumFrequencyId: '2',
    productGroup: 'EW',
    facilityURN: '0012345678',
    guaranteeCommencementDate: '2023-09-18T17:34:02.666Z',
    guaranteeExpiryDate: '2025-09-18T17:34:02.666Z',
    guaranteeFeePercentage: '5',
    guaranteePercentage: '5',
    dayBasis: '5',
    exposurePeriod: '12',
    maximumLiability: 100,
    cumulativeAmount: 0,
  };

  const axiosMock = new MockAdapter(axios);
  jest.mock('axios', () => jest.requireActual('axios'));

  const mockResponse = {
    status: 200,
    data: {
      result: mockResponsePremiumSchedule,
    },
  };

  axiosMock.onPost(`${process.env.APIM_MDM_URL}v1/premium/schedule`).reply(200, mockResponse);
  axiosMock.onGet(`${process.env.APIM_MDM_URL}v1/premium/segments/12345678`).reply(200, mockResponse);

  describe('when premium schedule parameters are empty', () => {
    it('should return a status of 400', async () => {
      const { status, body } = await getWithRequestBody().to('/premium-schedule');

      expect(status).toEqual(400);
      expect(body.results).toBeUndefined();
    });
  });

  describe('when premium schedule parameters are correct', () => {
    it('should return a status of 200', async () => {
      const { status, body } = await getWithRequestBody(payload).to('/premium-schedule');

      expect(status).toEqual(200);
      expect(body.data.result).toBeDefined();
    });
  });

  describe('when premium schedule parameters contain an injection ', () => {
    it('should call "postPremiumSchedule" without the injection', async () => {
      const spy = jest.spyOn(premiumScheduleController, 'postPremiumSchedule');

      const data = {
        ...payload,
        injection: 1,
      };

      const { status } = await getWithRequestBody(data).to('/premium-schedule');

      expect(status).toEqual(200);

      expect(spy).toHaveBeenCalledWith({
        ...payload,
        facilityURN: Number(payload.facilityURN),
      });
    });
  });

  const invalidFacilityUrnTestCases = [['123'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when facility urn is invalid', () => {
    test.each(invalidFacilityUrnTestCases)('returns a 400 if you provide an invalid facility urn %s', async (facilityUrn) => {
      const invalidPayload = payload;
      invalidPayload.facilityURN = facilityUrn;

      const { status, body } = await getWithRequestBody(invalidPayload).to('/premium-schedule');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid facility URN', status: 400 });
    });
  });
});
