import { app } from '../../src/createApp';
import { api } from '../api';

const { post } = api(app);
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { UKEF_ID } from '../../src/constants';

const { APIM_ESTORE_URL } = process.env;

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
  siteId: 'test',
  status: 'Created',
};

// mocks test for estore if exists
mock.onPost(`${APIM_ESTORE_URL}/site/sites?exporterName=testName`).reply(200, mockResponse);

describe('/estore', () => {
  const payload = {
    dealId: '12345',
    siteId: 'ukef',
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
});
