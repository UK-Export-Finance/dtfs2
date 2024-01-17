import { app } from '../../src/createApp';
import { api } from '../api';
import { createBuyerFolder, createDealFolder, createFacilityFolder, uploadSupportingDocuments } from '../../src/v1/controllers/estore/eStoreApi';

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
jest.mock('../../src/cron', () => ({
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

const mockExporterResponse = {
  siteId: 'test',
  status: 'Created',
};

const mockApiResponse = {
  status: 200,
};

// mocks test for estore if exists
mock.onPost(`${APIM_ESTORE_URL}site/sites?exporterName=testName`).reply(200, mockExporterResponse);
const estoreSitesRegex = new RegExp(`${APIM_ESTORE_URL}sites/.+`);
mock.onPost(estoreSitesRegex).reply(200, mockApiResponse);

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

  describe(`api.createBuyerFolder`, () => {
    it('should return an error response if siteId is invalid', async () => {
      const response = await createBuyerFolder('../../etc', { buyerName: 'testBuyer', exporterName: 'testName' });

      expect(response.status).toEqual(400);
    });

    it('should return an ok response if siteId is valid', async () => {
      const response = await createBuyerFolder('00738459', { buyerName: 'testBuyer', exporterName: 'testName' });

      expect(response.status).toEqual(200);
    });
  });

  describe(`api.createDealFolder`, () => {
    it('should return an error response if siteId is invalid', async () => {
      const createDealFolderPayload = {
        dealIdentifier: 'testDeal',
        exporterName: 'testName',
        buyerName: 'testBuyer',
        destinationMarket: 'UK',
        riskMarket: '1',
      };
      const response = await createDealFolder('../../etc', createDealFolderPayload);

      expect(response.status).toEqual(400);
    });

    it('should return an ok response if siteId is valid', async () => {
      const createDealFolderPayload = {
        dealIdentifier: 'testDeal',
        exporterName: 'testName',
        buyerName: 'testBuyer',
        destinationMarket: 'UK',
        riskMarket: '1',
      };
      const response = await createDealFolder('00748375', createDealFolderPayload);

      expect(response.status).toEqual(200);
    });
  });

  describe(`api.createFacilityFolder`, () => {
    it('should return an error response if siteId is invalid', async () => {
      const createFacilityFolderPayload = {
        dealIdentifier: 'testDeal',
        facilityIdentifier: 'testFacility',
        exporterName: 'testName',
        buyerName: 'testBuyer',
        destinationMarket: 'UK',
        riskMarket: '1',
      };

      const response = await createFacilityFolder('../../etc', '0071029412', createFacilityFolderPayload);

      expect(response.status).toEqual(400);
    });

    it('should return an error response if dealIdentifier is invalid', async () => {
      const createFacilityFolderPayload = {
        dealIdentifier: 'testDeal',
        facilityIdentifier: 'testFacility',
        exporterName: 'testName',
        buyerName: 'testBuyer',
        destinationMarket: 'UK',
        riskMarket: '1',
      };

      const response = await createFacilityFolder('00329453', '../../etc', createFacilityFolderPayload);

      expect(response.status).toEqual(400);
    });

    it('should return an ok response if siteId and dealIdentifier are valid', async () => {
      const createFacilityFolderPayload = {
        dealIdentifier: 'testDeal',
        facilityIdentifier: 'testFacility',
        exporterName: 'testName',
        buyerName: 'testBuyer',
        destinationMarket: 'UK',
        riskMarket: '1',
      };

      const response = await createFacilityFolder('00329453', '0071029412', createFacilityFolderPayload);

      expect(response.status).toEqual(200);
    });
  });

  describe(`api.uploadSupportingDocuments`, () => {
    it('should return an error response if siteId is invalid', async () => {
      const uploadSupportingDocumentsPayload = {
        buyerName: 'testBuyer',
        documentType: 'testType',
        fileName: 'testFile',
        fileLocationPath: 'testLocation',
      };
      const response = await uploadSupportingDocuments('../../etc', '0071029412', uploadSupportingDocumentsPayload);

      expect(response.status).toEqual(400);
    });

    it('should return an error response if dealIdentifier is invalid', async () => {
      const uploadSupportingDocumentsPayload = {
        buyerName: 'testBuyer',
        documentType: 'testType',
        fileName: 'testFile',
        fileLocationPath: 'testLocation',
      };
      const response = await uploadSupportingDocuments('00329453', '../../etc', uploadSupportingDocumentsPayload);

      expect(response.status).toEqual(400);
    });

    it('should return an error response if dealIdentifier is invalid', async () => {
      const uploadSupportingDocumentsPayload = {
        buyerName: 'testBuyer',
        documentType: 'testType',
        fileName: 'testFile',
        fileLocationPath: 'testLocation',
      };
      const response = await uploadSupportingDocuments('00329453', '0071029412', uploadSupportingDocumentsPayload);

      expect(response.status).toEqual(200);
    });
  });
});
