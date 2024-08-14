const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const api = require('./api');

const mockAxios = new MockAdapter(axios);

describe('API is protected against SSRF attacks', () => {
  describe('updateUserPassword', () => {
    const mockResponse = 'Mock user';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/users\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid user id' };

      const response = await api.updateUserPassword(urlTraversal, 'password update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid user id' };

      const response = await api.updateUserPassword(localIp, 'password update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the user id is valid', async () => {
      const validUserId = '5ce819935e539c343f141ece';

      const response = await api.updateUserPassword(validUserId, 'password update');

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid user id' };

      const response = await api.updateUserPassword(urlTraversal, 'password update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid user id' };

      const response = await api.updateUserPassword(localIp, 'password update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the user id is valid', async () => {
      const validUserId = '5ce819935e539c343f141ece';

      const response = await api.updateUserPassword(validUserId, 'password update');

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.createFacilityAmendment(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.createFacilityAmendment(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.createFacilityAmendment(validFacilityId, 'mock token');

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
      const urlTraversal = '../../../etc/stealpassword';
      const validAmendmentId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updateAmendment(urlTraversal, validAmendmentId, 'mock data', 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const validFacilityId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid amendment id' };

      const response = await api.updateAmendment(validFacilityId, localIp, 'mock data', 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';
      const validAmendmentId = '5ce819935e539c343f141ece';

      const response = await api.updateAmendment(validFacilityId, validAmendmentId, 'mock data', 'mock token');

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await apiFunction(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await apiFunction(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await apiFunction(validFacilityId, 'mock token');

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
      const urlTraversal = '../../../etc/stealpassword';
      const validAmendmentId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getAmendmentById(urlTraversal, validAmendmentId, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const validFacilityId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid amendment id' };

      const response = await api.getAmendmentById(validFacilityId, localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';
      const validAmendmentId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentById(validFacilityId, validAmendmentId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getAmendmentsByDealId', () => {
    const mockResponse = 'Mock amendments';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/deals\/.*\/amendments$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.getAmendmentsByDealId(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.getAmendmentsByDealId(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentsByDealId(validDealId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getAmendmentInProgressByDealId', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/deals\/.*\/amendments\/in-progress$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.getAmendmentInProgressByDealId(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.getAmendmentInProgressByDealId(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentInProgressByDealId(validDealId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getCompletedAmendmentByDealId', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/deals\/.*\/amendments\/completed$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.getCompletedAmendmentByDealId(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.getCompletedAmendmentByDealId(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.getCompletedAmendmentByDealId(validDealId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getLatestCompletedAmendmentByDealId', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/deals\/.*\/amendments\/completed\/latest$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.getLatestCompletedAmendmentByDealId(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.getLatestCompletedAmendmentByDealId(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.getLatestCompletedAmendmentByDealId(validDealId, 'mock token');

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid party urn' };

      const response = await api.getParty(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
});
