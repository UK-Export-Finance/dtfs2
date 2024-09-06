const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const api = require('./api');

const mockAxios = new MockAdapter(axios);
const localIp = '127.0.0.1';
const urlTraversal = '../../../etc/stealpassword';
const validId = '5ce819935e539c343f141ece';

describe('API is protected against SSRF attacks', () => {
  describe('updateUserPassword', () => {
    const mockResponse = 'Mock user';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/users\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id' };

      const response = await api.updateUserPassword(urlTraversal, 'password update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id' };

      const response = await api.updateUserPassword(localIp, 'password update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the user id is valid', async () => {
      const response = await api.updateUserPassword(validId, 'password update');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getUser', () => {
    const mockResponse = 'Mock user';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/users\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id' };

      const response = await api.updateUserPassword(urlTraversal, 'password update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid user id' };

      const response = await api.updateUserPassword(localIp, 'password update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the user id is valid', async () => {
      const response = await api.updateUserPassword(validId, 'password update');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('createFacilityAmendment', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/facilities\/.*\/amendments$/;
      mockAxios.onPost(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.createFacilityAmendment(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.createFacilityAmendment(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const response = await api.createFacilityAmendment(validId, 'mock token');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateAmendment', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/facilities\/.*\/amendments\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const validAmendmentId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updateAmendment(urlTraversal, validAmendmentId, 'mock data', 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid amendment id' };

      const response = await api.updateAmendment(validId, localIp, 'mock data', 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validAmendmentId = '5ce819935e539c343f141ece';
      const response = await api.updateAmendment(validId, validAmendmentId, 'mock data', 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  const getAmendmentDetailsByFacilityIdFunctionsToTest = [
    {
      description: 'getAmendmentInProgress',
      apiFunction: api.getAmendmentInProgress,
      url: /^.*\/v1\/facilities\/.*\/amendments\/in-progress$/,
    },
    {
      description: 'getCompletedAmendment',
      apiFunction: api.getCompletedAmendment,
      url: /^.*\/v1\/facilities\/.*\/amendments\/completed$/,
    },
    {
      description: 'getLatestCompletedAmendmentValue',
      apiFunction: api.getLatestCompletedAmendmentValue,
      url: /^.*\/v1\/facilities\/.*\/amendments\/completed\/latest-value$/,
    },
    {
      description: 'getLatestCompletedAmendmentDate',
      apiFunction: api.getLatestCompletedAmendmentDate,
      url: /^.*\/v1\/facilities\/.*\/amendments\/completed\/latest-cover-end-date$/,
    },
    {
      description: 'getLatestCompletedAmendmentFacilityEndDate',
      apiFunction: api.getLatestCompletedAmendmentFacilityEndDate,
      url: /^.*\/v1\/facilities\/.*\/amendments\/completed\/latest-facility-end-date$/,
    },
    {
      description: 'getAmendmentsByFacilityId',
      apiFunction: api.getAmendmentsByFacilityId,
      url: /^.*\/v1\/facilities\/.*\/amendments$/,
    },
    {
      description: 'getAmendmentsByFacilityId',
      apiFunction: api.getAmendmentsByFacilityId,
      url: /^.*\/v1\/facilities\/.*\/amendments$/,
    },
  ];

  describe.each(getAmendmentDetailsByFacilityIdFunctionsToTest)('$description', ({ apiFunction, url }) => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await apiFunction(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await apiFunction(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const response = await apiFunction(validId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getAmendmentById', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/facilities\/.*\/amendments\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getAmendmentById(urlTraversal, validId, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid amendment id' };

      const response = await api.getAmendmentById(validId, localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validAmendmentId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentById(validId, validAmendmentId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  const getAmendmentDetailsByDealIdFunctionsToTest = [
    {
      description: 'getAmendmentsByDealId',
      apiFunction: api.getAmendmentsByDealId,
      url: /^.*\/v1\/deals\/.*\/amendments$/,
    },
    {
      description: 'getAmendmentInProgressByDealId',
      apiFunction: api.getAmendmentInProgressByDealId,
      url: /^.*\/v1\/deals\/.*\/amendments\/in-progress$/,
    },
    {
      description: 'getCompletedAmendmentByDealId',
      apiFunction: api.getCompletedAmendmentByDealId,
      url: /^.*\/v1\/deals\/.*\/amendments\/completed$/,
    },
    {
      description: 'getLatestCompletedAmendmentByDealId',
      apiFunction: api.getLatestCompletedAmendmentByDealId,
      url: /^.*\/v1\/deals\/.*\/amendments\/completed\/latest$/,
    },
  ];

  describe.each(getAmendmentDetailsByDealIdFunctionsToTest)('$description', ({ apiFunction, url }) => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await apiFunction(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await apiFunction(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const response = await apiFunction(validId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getParty', () => {
    const mockResponse = 'Mock party';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/party\/urn\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid party urn' };

      const response = await api.getParty(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid party urn' };

      const response = await api.getParty(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the party urn is valid', async () => {
      const validPartyUrn = '00381736';

      const response = await api.getParty(validPartyUrn, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('updateDealCancellation', () => {
    const mockData = {};
    const mockResponse = 'Mock deal cancellation';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/deals\/.*\/cancellation$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDealCancellation(urlTraversal, mockData, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDealCancellation(localIp, mockData, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const response = await api.updateDealCancellation(validId, mockData, 'mock token');

      expect(response).toEqual(mockResponse);
    });
  });
});
