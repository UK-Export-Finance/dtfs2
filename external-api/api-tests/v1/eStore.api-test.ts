import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { app } from '../../src/createApp';
import { api } from '../api';
import { UKEF_ID, ESTORE_CRON_STATUS } from '../../src/constants';
import { Estore, EstoreAxiosResponse } from '../../src/interfaces';

const { post } = api(app);

const { APIM_ESTORE_URL } = process.env;

const payload: Estore = {
  dealId: new ObjectId('6597dffeb5ef5ff4267e5044'),
  siteId: 'ukef',
  facilityIdentifiers: [1234567890, 1234567891],
  supportingInformation: ['test'],
  exporterName: 'testName',
  buyerName: 'testBuyer',
  dealIdentifier: '1234567890',
  destinationMarket: 'UK',
  riskMarket: '1',
};

const axiosMock = new MockAdapter(axios);

const mockInsertOne = jest.fn();
const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();

// Mock MongoDB calls
jest.mock('../../src/database/mongo-client', () => ({
  getCollection: jest.fn(() => ({
    insertOne: mockInsertOne.mockResolvedValue({ insertedId: '6597dffeb5ef5ff4267e5043' }),
    findOne: mockFindOne,
    updateOne: mockUpdateOne,
  })),
}));

const mockExporterResponse = {
  siteId: 'test',
  status: 'Created',
};

const mockApiResponse = {
  status: HttpStatusCode.Ok,
};

// mocks test for estore if exists
axiosMock.onPost(`${APIM_ESTORE_URL}site/sites?exporterName=testName`).reply(HttpStatusCode.Ok, mockExporterResponse);
const estoreSitesRegex = new RegExp(`${APIM_ESTORE_URL}sites/.+`);
axiosMock.onPost(estoreSitesRegex).reply(HttpStatusCode.Ok, mockApiResponse);

describe('/estore', () => {
  describe('Empty payload', () => {
    it('should return a status of 400 and an invalid request message', async () => {
      const { status, body } = (await post().to('/estore')) as EstoreAxiosResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.message).toEqual('Invalid request');
    });
  });

  describe('When the deal ID with is not valid', () => {
    it('should return a status of 400 with Invalid IDs error message when ID is `0010000000`', async () => {
      const invalidPayload = {
        ...payload,
        dealIdentifier: UKEF_ID.TEST,
      };
      const { status, body } = (await post(invalidPayload).to('/estore')) as EstoreAxiosResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.message).toEqual('Invalid IDs');
    });

    it('should return a status of 400 with Invalid IDs error message when ID is `Pending`', async () => {
      const invalidPayload = {
        ...payload,
        dealIdentifier: UKEF_ID.PENDING,
      };

      const { status, body } = (await post(invalidPayload).to('/estore')) as EstoreAxiosResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.message).toEqual('Invalid IDs');
    });
  });

  describe('When the facility ID with is not valid', () => {
    it('should return a status of 400 with Invalid IDs error message when ID is `0010000000`', async () => {
      const invalidPayload = {
        ...payload,
        facilityIdentifiers: [UKEF_ID.TEST],
      };
      const { status, body } = (await post(invalidPayload).to('/estore')) as EstoreAxiosResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.message).toEqual('Invalid IDs');
    });

    it('should return a status of 400 with Invalid IDs error message when ID is `Pending`', async () => {
      const invalidPayload = {
        ...payload,
        facilityIdentifiers: [UKEF_ID.PENDING],
      };

      const { status, body } = (await post(invalidPayload).to('/estore')) as EstoreAxiosResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.message).toEqual('Invalid IDs');
    });
  });

  describe('When the Mongo deal ID is not a valid Mongo ObjectID', () => {
    const invalidObjectIds = [[], {}, '', 'invalid', '!"£'];
    it.each(invalidObjectIds)('Should return 500 for a %s string which is neither 12 bytes nor 24 bytes hex characters or an integer', async (dealId) => {
      const invalidPayload = {
        ...payload,
        dealId,
      };

      const { status, body } = (await post(invalidPayload).to('/estore')) as EstoreAxiosResponse;

      expect(status).toEqual(HttpStatusCode.InternalServerError);
      expect(body.message).toEqual('Unable to create eStore directories');
    });
  });

  describe('eStore CRON jobs', () => {
    beforeEach(() => {
      mockFindOne.mockReset();
      mockInsertOne.mockReset();
    });

    it('Should return 201 for a new deal payload', async () => {
      const { status } = await post(payload).to('/estore');

      expect(status).toEqual(HttpStatusCode.Created);
    });

    it('Should create a new entry cron-job-logs collection for a new payload', async () => {
      await post(payload).to('/estore');

      // Look up for the deal ID in the collection
      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ 'payload.dealId': { $eq: new ObjectId(payload.dealId) } });

      // Insert a new entry in the collection
      expect(mockInsertOne).toHaveBeenCalledTimes(1);
      expect(mockInsertOne).toHaveBeenCalledWith({
        payload,
        timestamp: expect.any(Number) as number,
        cron: {
          site: { status: ESTORE_CRON_STATUS.PENDING },
          term: { status: ESTORE_CRON_STATUS.PENDING },
          buyer: { status: ESTORE_CRON_STATUS.PENDING },
          deal: { status: ESTORE_CRON_STATUS.PENDING },
          facility: { status: ESTORE_CRON_STATUS.PENDING },
        },
      });
    });

    it('Should not create a new entry cron-job-logs collection for an existing payload', async () => {
      mockFindOne.mockResolvedValueOnce({ payload });

      await post(payload).to('/estore');

      // Look up for the deal ID in the collection
      expect(mockFindOne).toHaveBeenCalledWith({ 'payload.dealId': { $eq: new ObjectId(payload.dealId) } });

      // Insert a new entry in the collection
      expect(mockInsertOne).not.toHaveBeenCalled();
    });
  });
});
