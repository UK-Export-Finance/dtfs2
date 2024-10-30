import { InvalidDealIdError } from '@ukef/dtfs2-common';

const { ObjectId } = require('mongodb');
const { generatePortalAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { MOCK_TFM_SESSION_USER } = require('../src/v1/__mocks__/mock-tfm-session-user');
const { MOCK_PORTAL_USERS } = require('../src/v1/__mocks__/mock-portal-users');

const api = jest.requireActual('../src/v1/api');

const mockAxios = new MockAdapter(axios);

const localIp = '127.0.0.1';
const urlTraversal = '../../../etc/stealpassword';

describe('API is protected against SSRF attacks', () => {
  const MOCK_PORTAL_USER_AUDIT_DETAILS = generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id);
  const validDealId = '5ce819935e539c343f141ece';
  const portalAuditDetails = generatePortalAuditDetails(new ObjectId());

  describe('findOnePortalDeal', () => {
    const mockResponse = {
      deal: 'Mock deal',
    };
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/deals\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });
    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOnePortalDeal(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOnePortalDeal(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.findOnePortalDeal(validDealId);

      expect(response).toEqual(mockResponse.deal);
    });
  });

  describe('updatePortalDeal', () => {
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/deals\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updatePortalDeal(urlTraversal, { deal: 'Mock deal' }, MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updatePortalDeal(localIp, { deal: 'Mock deal' }, MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.updatePortalDeal(validDealId, { deal: 'Mock deal' }, MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updatePortalBssDealStatus', () => {
    const mockResponse = 'Mock status';

    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/deals\/.*\/status$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updatePortalBssDealStatus({ dealId: urlTraversal, status: 'Mock status', auditDetails: portalAuditDetails });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updatePortalBssDealStatus({ dealId: localIp, status: 'Mock status', auditDetails: portalAuditDetails });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.updatePortalBssDealStatus({ dealId: validDealId, status: 'Mock status', auditDetails: portalAuditDetails });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('addPortalDealComment', () => {
    const mockResponse = 'Mock comment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/deals\/.*\/comment$/;
      mockAxios.onPost(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const addingAPortalDealComment = () => api.addPortalDealComment(urlTraversal, 'mock', 'mock', MOCK_PORTAL_USER_AUDIT_DETAILS);

      await expect(addingAPortalDealComment).rejects.toThrow(`Invalid deal id: ${urlTraversal}`);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const addingAPortalDealComment = () => api.addPortalDealComment(localIp, 'mock', 'mock', MOCK_PORTAL_USER_AUDIT_DETAILS);

      await expect(addingAPortalDealComment).rejects.toThrow(`Invalid deal id: ${localIp}`);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.addPortalDealComment(validDealId, 'mock', 'mock', MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updatePortalFacilityStatus', () => {
    const mockResponse = 'Mock status';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/facilities\/.*\/status$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updatePortalFacilityStatus(urlTraversal, 'Mock status', MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updatePortalFacilityStatus(localIp, 'Mock status', MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.updatePortalFacilityStatus(validFacilityId, 'Mock status', MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findOneDeal', () => {
    const mockResponse = { deal: 'Mock deal' };
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOneDeal(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOneDeal(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.findOneDeal(validDealId);

      expect(response).toEqual(mockResponse.deal);
    });
  });

  describe('updateDeal', () => {
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDeal({ dealId: urlTraversal, dealUpdate: 'Mock update' });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDeal({ dealId: localIp, dealUpdate: 'Mock update' });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.updateDeal({ dealId: validFacilityId, dealUpdate: 'Mock update' });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateDealSnapshot', () => {
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/snapshot$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDealSnapshot(urlTraversal, 'Mock update', MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDealSnapshot(localIp, 'Mock update', MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.updateDealSnapshot(validDealId, 'Mock update', MOCK_PORTAL_USER_AUDIT_DETAILS);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findOneFacility', () => {
    const mockResponse = 'Mock facility';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.findOneFacility(urlTraversal, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.findOneFacility(localIp, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.findOneFacility(validFacilityId, 'Mock update');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findFacilitiesByDealId', () => {
    const mockResponse = 'Mock facilities';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/facilities$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findFacilitiesByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findFacilitiesByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.findFacilitiesByDealId(validDealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateFacility', () => {
    const mockResponse = 'Mock facility';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updateFacility({
        facilityId: urlTraversal,
        tfmUpdate: 'mock update',
        auditDetails: generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id),
      });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updateFacility({
        facilityId: localIp,
        tfmUpdate: 'mock update',
        auditDetails: generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id),
      });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.updateFacility({
        facilityId: validFacilityId,
        tfmUpdate: 'mock update',
        auditDetails: generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id),
      });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('createFacilityAmendment', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*\/amendments$/;
      mockAxios.onPost(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.createFacilityAmendment(urlTraversal, generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id));

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.createFacilityAmendment(localIp, generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id));

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.createFacilityAmendment(validFacilityId, generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id));

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateFacilityAmendment', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*\/amendments\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const validAmendmentId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility Id or amendment Id provided' };

      const response = await api.updateFacilityAmendment(urlTraversal, validAmendmentId, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility Id or amendment Id provided' };

      const response = await api.updateFacilityAmendment(validFacilityId, localIp, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility and amendment ids are valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';
      const validAmendmentId = '5ce819935e539c343f141ece';

      const response = await api.updateFacilityAmendment(validFacilityId, validAmendmentId, 'Mock update');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getAmendmentInProgress', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*\/amendments\/in-progress$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getAmendmentInProgress(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getAmendmentInProgress(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentInProgress(validFacilityId);

      expect(response).toMatchObject({ data: mockResponse, status: 200 });
    });
  });

  const getAmendmentDetailsByFacilityIdFunctionsToTest = [
    {
      description: 'getCompletedAmendment',
      apiFunction: api.getCompletedAmendment,
      url: /^.*\/v1\/tfm\/facilities\/.*\/amendments\/completed$/,
    },
    {
      description: 'getLatestCompletedAmendmentValue',
      apiFunction: api.getLatestCompletedAmendmentValue,
      url: /^.*\/v1\/tfm\/facilities\/.*\/amendments\/completed\/latest-value$/,
    },
    {
      description: 'getLatestCompletedAmendmentDate',
      apiFunction: api.getLatestCompletedAmendmentDate,
      url: /^.*\/v1\/tfm\/facilities\/.*\/amendments\/completed\/latest-cover-end-date$/,
    },
    {
      description: 'getLatestCompletedAmendmentFacilityEndDate',
      apiFunction: api.getLatestCompletedAmendmentFacilityEndDate,
      url: /^.*\/v1\/tfm\/facilities\/.*\/amendments\/completed\/latest-facility-end-date$/,
    },
    {
      description: 'getAmendmentByFacilityId',
      apiFunction: api.getAmendmentByFacilityId,
      url: /^.*\/v1\/tfm\/facilities\/.*\/amendments$/,
    },
  ];

  describe.each(getAmendmentDetailsByFacilityIdFunctionsToTest)('$description', ({ apiFunction, url }) => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await apiFunction(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await apiFunction(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await apiFunction(validFacilityId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getAmendmentById', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*\/amendments\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const validAmendmentId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility Id or amendment Id provided' };

      const response = await api.getAmendmentById(urlTraversal, validAmendmentId);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility Id or amendment Id provided' };

      const response = await api.getAmendmentById(validFacilityId, localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility and amendment ids are valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';
      const validAmendmentId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentById(validFacilityId, validAmendmentId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getAmendmentsByDealId', () => {
    const mockResponse = 'Mock amendments';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/amendments$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getAmendmentsByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getAmendmentsByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.getAmendmentsByDealId(validDealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getAmendmentInProgressByDealId', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/amendments\/in-progress$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getAmendmentInProgressByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getAmendmentInProgressByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.getAmendmentInProgressByDealId(validDealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getCompletedAmendmentByDealId', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/amendments\/completed$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getCompletedAmendmentByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getCompletedAmendmentByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.getCompletedAmendmentByDealId(validDealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getLatestCompletedAmendmentByDealId', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/amendment\/completed\/latest$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getLatestCompletedAmendmentByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getLatestCompletedAmendmentByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.getLatestCompletedAmendmentByDealId(validDealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateGefFacility', () => {
    const mockResponse = 'Mock facility';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/facilities\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.updateGefFacility({ facilityId: urlTraversal, facilityUpdate: {}, auditDetails: MOCK_PORTAL_USER_AUDIT_DETAILS });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.updateGefFacility({ facilityId: localIp, facilityUpdate: {}, auditDetails: MOCK_PORTAL_USER_AUDIT_DETAILS });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacility = '5ce819935e539c343f141ece';

      const response = await api.updateGefFacility({ facilityId: validFacility, facilityUpdate: {}, auditDetails: MOCK_PORTAL_USER_AUDIT_DETAILS });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getCompanyInfo', () => {
    const mockResponse = 'Mock company';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/party-db\/urn\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid party urn provided' };

      const response = await api.getCompanyInfo(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid party urn provided' };

      const response = await api.getCompanyInfo(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the party URN is valid', async () => {
      const validPartyUrn = '00381743';

      const response = await api.getCompanyInfo(validPartyUrn);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findUserById', () => {
    const mockResponse = 'Mock user';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/users\/id\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.findUserById(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.findUserById(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the user id is valid', async () => {
      const validUserId = '5ce819935e539c343f141ece';

      const response = await api.findUserById(validUserId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findPortalUserById', () => {
    const mockResponse = 'Mock user';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/user\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.findPortalUserById(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.findPortalUserById(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the user id is valid', async () => {
      const validUserId = '5ce819935e539c343f141ece';

      const response = await api.findPortalUserById(validUserId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateUserTasks', () => {
    const mockResponse = 'Mock user';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/users\/.*\/tasks$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.updateUserTasks(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.updateUserTasks(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the user id is valid', async () => {
      const validUserId = '5ce819935e539c343f141ece';

      const response = await api.updateUserTasks(validUserId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findOneTeam', () => {
    const mockResponse = { team: 'Mock team' };
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/teams\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid team id provided' };

      const response = await api.findOneTeam(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid team id provided' };

      const response = await api.findOneTeam(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the team id is valid', async () => {
      const validTeamId = 'UNDERWRITERS';

      const response = await api.findOneTeam(validTeamId);

      expect(response).toEqual(mockResponse.team);
    });
  });

  describe('findTeamMembers', () => {
    const mockResponse = 'Mock team members';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/users\/team\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid team id provided' };

      const response = await api.findTeamMembers(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid team id provided' };

      const response = await api.findTeamMembers(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the team id is valid', async () => {
      const validTeamId = 'UNDERWRITERS';

      const response = await api.findTeamMembers(validTeamId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getCurrencyExchangeRate', () => {
    const mockResponse = 'Mock exchange rate';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/currency-exchange-rate\/.*\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const validCurrencyCode = 'USD';
      const expectedResponse = { status: 400, data: 'Invalid currency provided' };

      const response = await api.getCurrencyExchangeRate(urlTraversal, validCurrencyCode);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const validCurrencyCode = 'USD';
      const expectedResponse = { status: 400, data: 'Invalid currency provided' };

      const response = await api.getCurrencyExchangeRate(validCurrencyCode, localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the currencies are valid', async () => {
      const validCurrencyCodeUSD = 'USD';
      const validCurrencyCodeGBP = 'GBP';

      const response = await api.getCurrencyExchangeRate(validCurrencyCodeGBP, validCurrencyCodeUSD);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findOneGefDeal', () => {
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/deals\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.findOneGefDeal(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.findOneGefDeal(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.findOneGefDeal(validDealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updatePortalGefDealStatus', () => {
    const auditDetails = generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id);
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/deals\/.*\/status$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updatePortalGefDealStatus({ dealId: urlTraversal, status: 'mock status', auditDetails });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updatePortalGefDealStatus({ dealId: localIp, status: 'mock status', auditDetails });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.updatePortalGefDealStatus({ dealId: validDealId, status: 'mock status', auditDetails });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updatePortalGefDeal', () => {
    const auditDetails = generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id);
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/deals\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updatePortalGefDeal({ dealId: urlTraversal, status: 'mock update', auditDetails });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updatePortalGefDeal({ dealId: localIp, status: 'mock update', auditDetails });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.updatePortalGefDeal({ dealId: validDealId, status: 'mock update', auditDetails });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateGefMINActivity', () => {
    const mockResponse = 'Mock deal';
    const auditDetails = generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id);
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/deals\/activity\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updateGefMINActivity({ dealId: urlTraversal, auditDetails });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updateGefMINActivity({ dealId: localIp, auditDetails });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.updateGefMINActivity({ dealId: validDealId, auditDetails });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('addUnderwriterCommentToGefDeal', () => {
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/deals\/.*\/comment$/;
      mockAxios.onPost(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const addingAComment = () => api.addUnderwriterCommentToGefDeal(urlTraversal, 'mock comment type', 'mock comment');

      await expect(addingAComment).rejects.toThrow(`Invalid deal id: ${urlTraversal}`);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const addingAComment = () => api.addUnderwriterCommentToGefDeal(localIp, 'mock comment type', 'mock comment');

      await expect(addingAComment).rejects.toThrow(`Invalid deal id: ${localIp}`);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.addUnderwriterCommentToGefDeal(validDealId, 'mock comment type', 'mock comment');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findBankById', () => {
    const mockResponse = 'Mock bank';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/bank\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid bank id provided' };

      const response = await api.findBankById(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid bank id provided' };

      const response = await api.findBankById(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the bank id is valid', async () => {
      const validBankId = 3;

      const response = await api.findBankById(validBankId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getGefMandatoryCriteriaByVersion', () => {
    const mockResponse = 'Mock mandatory criteria';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/mandatory-criteria\/version\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid mandatory criteria version provided' };

      const response = await api.getGefMandatoryCriteriaByVersion(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid mandatory criteria version provided' };

      const response = await api.getGefMandatoryCriteriaByVersion(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the version is valid', async () => {
      const validVersion = '37';

      const response = await api.getGefMandatoryCriteriaByVersion(validVersion);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateDealCancellation', () => {
    const mockResponse = 'Mock response';
    const auditDetails = generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id);
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/cancellation$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      await expect(api.updateDealCancellation({ dealId: urlTraversal, dealCancellationUpdate: {}, auditDetails })).rejects.toThrow(
        new InvalidDealIdError(urlTraversal.toString()),
      );
    });

    it('Returns an error when a local IP is supplied', async () => {
      await expect(api.updateDealCancellation({ dealId: localIp, dealCancellationUpdate: {}, auditDetails })).rejects.toThrow(
        new InvalidDealIdError(localIp.toString()),
      );
    });

    it('Makes an axios request when the version is valid', async () => {
      const response = await api.updateDealCancellation({ dealId: validDealId, dealCancellationUpdate: {}, auditDetails });

      expect(response).toEqual(mockResponse);
    });
  });
});
