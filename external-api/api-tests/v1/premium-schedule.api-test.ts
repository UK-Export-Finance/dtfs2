import { app } from '../../src/createApp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getWithRequestBody } = require('../api')(app);
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import premiumScheduleController from '../../src/v1/controllers/premium-schedule.controller';
import { mockResponsePremiumSchedule } from '../test-mocks/premium-schedule';

describe('/premium-schedule', () => {
  const payload = {
    premiumTypeId: '2',
    premiumFrequencyId: '2',
    productGroup: 'EW',
    facilityURN: '12345',
    guaranteeCommencementDate: '2023-09-18T17:34:02.666Z',
    guaranteeExpiryDate: '2025-09-18T17:34:02.666Z',
    guaranteeFeePercentage: '5',
    guaranteePercentage: '5',
    dayBasis: '5',
    exposurePeriod: '12',
    maximumLiability: 100,
    cumulativeAmount: 0,
  };

  const mock = new MockAdapter(axios);
  jest.mock('axios', () => jest.requireActual('axios'));

  const mockResponse = {
    status: 200,
    data: {
      result: mockResponsePremiumSchedule,
    },
  };

  mock.onPost(`${process.env.APIM_MDM_URL}premium/schedule`).reply(200, mockResponse);
  mock.onGet(`${process.env.APIM_MDM_URL}premium/segments/12345`).reply(200, mockResponse);

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
});
