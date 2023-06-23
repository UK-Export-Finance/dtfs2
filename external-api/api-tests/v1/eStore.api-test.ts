import { app } from '../../src/createApp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { post } = require('../api')(app);
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { UKEF_ID } from '../../src/constants';

const eStoreUrl: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_URL;

const mockInsertOne = jest.fn();
const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockFindOneAndUpdate = jest.fn();

// mocks mongodb calls
jest.mock('../../src/database/mongo-client', () => ({
  getCollection: jest.fn(() => ({
    insertOne: mockInsertOne,
    findOne: mockFindOne,
    updateOne: mockUpdateOne,
  })),
}));

// mocks various cronJob database calls
jest.mock('../../src/cronJobs', () => ({
  eStoreCronJobManager: jest.fn(() => ({
    insertOne: mockInsertOne,
    onComplete: mockInsertOne,
  })),
  eStoreTermStoreAndBuyerFolder: jest.fn(() => ({
    findOneAndUpdate: mockFindOneAndUpdate,
  })),
}));

const mock = new MockAdapter(axios);
jest.mock('axios', () => jest.requireActual('axios'));

const mockResponse = {
  siteName: 'test',
  status: 'Created',
};

// mocks test for estore if exists
mock.onPost(`${eStoreUrl}/site/exist`).reply(200, mockResponse);

describe('/estore', () => {
  const payload = {
    dealId: '12345',
    siteName: 'google',
    facilityIdentifiers: '99999',
    supportingInformation: 'test',
    exporterName: 'testName',
    buyerName: 'testBuyer',
    dealIdentifier: '12345',
    destinationMarket: 'UK',
    riskMarket: '1',
  };

  describe('when the body is empty', () => {
    it('should return a status of 200 and an empty data response', async () => {
      const { status, body } = await post().to('/estore');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });

  describe('when the input is not valid - dealIdentifier contains 100000', () => {
    it('should return a status of 200 and an empty data response', async () => {
      const { status, body } = await post({ ...payload, dealIdentifier: '100000' }).to('/estore');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });

  describe(`when the input is not valid - facilityIdentifiers contains ${UKEF_ID.PENDING}`, () => {
    it('should return a status of 200 and an empty data response', async () => {
      const { status, body } = await post({ ...payload, facilityIdentifiers: UKEF_ID.PENDING }).to('/estore');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });

  describe(`when the input is valid and cron does not exist and the payload contains and injection`, () => {
    it('should return a status of 200 and should not insert the injection into the database', async () => {
      const { status } = await post({ ...payload, injection: 1 }).to('/estore');

      expect(mockInsertOne).toHaveBeenCalledWith({
        ...payload,
        dealCronJob: {
          status: 'Pending',
        },
        facilityCronJob: {
          status: 'Pending',
        },
        siteExists: false,
        siteName: null,
        timestamp: expect.any(Date),
      });

      expect(status).toEqual(200);
    });
  });
});
