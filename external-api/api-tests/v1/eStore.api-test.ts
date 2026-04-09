import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { UKEF_ID } from '@ukef/dtfs2-common';
import { app } from '../../server/createApp';
import { api } from '../api';
import { ESTORE_CRON_STATUS, ESTORE_SITE_STATUS } from '../../server/constants';
import { Estore, EstoreAxiosResponse } from '../../server/interfaces';

const { post } = api(app);

const { APIM_ESTORE_URL, EXTERNAL_API_URL } = process.env;

const payload: Estore = {
  dealId: '6597dffeb5ef5ff4267e5044',
  siteId: 'ukef',
  facilityIdentifiers: [1234567890, 1234567891],
  supportingInformation: [
    {
      documentType: 'test',
      fileName: 'test.docx',
      fileLocationPath: 'directory/',
      parentId: 'abc',
    },
  ],
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
jest.mock('../../server/database/mongo-client', () => ({
  getCollection: jest.fn(() => ({
    insertOne: mockInsertOne.mockResolvedValue({ insertedId: '6597dffeb5ef5ff4267e5043' }),
    findOne: mockFindOne,
    updateOne: mockUpdateOne,
  })),
}));

// Mock GovNotify email
const mockSuccessfulEmailResponse = {
  status: HttpStatusCode.Created,
  data: {
    content: {},
  },
};

axiosMock.onPost(`${EXTERNAL_API_URL}/email`).reply(HttpStatusCode.Created, mockSuccessfulEmailResponse.data);

const mockExporterResponse = {
  siteId: 'ukef',
  status: ESTORE_SITE_STATUS.CREATED,
};

// mocks test for estore if exists
axiosMock.onGet(`${APIM_ESTORE_URL}v1//sites?exporterName=testName`).reply(HttpStatusCode.Ok, mockExporterResponse);

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
    it.each(invalidObjectIds)('Should return 400 for a %s string which is neither 12 bytes nor 24 bytes hex characters or an integer', async (dealId) => {
      const invalidPayload = {
        ...payload,
        dealId,
      };

      const { status, body } = (await post(invalidPayload).to('/estore')) as EstoreAxiosResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.message).toEqual('Invalid deal ObjectId');
    });
  });

  describe('eStore CRON jobs', () => {
    beforeEach(() => {
      mockFindOne.mockReset();
      mockInsertOne.mockReset();
    });

    it('Should return 500 for a new deal payload with site neither created, nor pending and absent', async () => {
      const unknownSite = {
        ...payload,
        exporterName: 'invalid-site-status',
      };

      const { status } = await post(unknownSite).to('/estore');

      expect(status).toEqual(HttpStatusCode.InternalServerError);
    });

    it('Should return 201 for a new deal payload', async () => {
      const { status } = await post(payload).to('/estore');

      expect(status).toEqual(HttpStatusCode.Created);
    });

    it('Should create a new entry cron-job-logs collection for a new payload', async () => {
      await post(payload).to('/estore');

      // Look up for the deal ID in the collection
      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ 'payload.dealId': { $eq: payload.dealId } });

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
          document: { status: ESTORE_CRON_STATUS.PENDING },
        },
      });
    });

    it('Should not create a new entry cron-job-logs collection for an existing payload', async () => {
      mockFindOne.mockResolvedValueOnce({ payload });

      await post(payload).to('/estore');

      // Look up for the deal ID in the collection
      expect(mockFindOne).toHaveBeenCalledWith({ 'payload.dealId': { $eq: payload.dealId } });

      // Insert a new entry in the collection
      expect(mockInsertOne).not.toHaveBeenCalled();
    });
  });
});
