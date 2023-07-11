const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const api = require('./api');

const mockAxios = new MockAdapter(axios);

describe('API is protected against SSRF attacks', () => {
  describe('updateUserPassword', () => {
    mockAxios.reset();
    const mockResponse = 'Mock user';
    const url = /^.*\/v1\/users\/.*$/;
    mockAxios.onPut(url).reply(200, mockResponse);
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
    mockAxios.reset();
    const mockResponse = 'Mock user';
    const url = /^.*\/v1\/users\/.*$/;
    mockAxios.onPut(url).reply(200, mockResponse);
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
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/facilities\/.*\/amendments$/;
    mockAxios.onPost(url).reply(200, mockResponse);
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
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/facilities\/.*\/amendments\/.*$/;
    mockAxios.onPut(url).reply(200, mockResponse);
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

  describe('getAmendmentInProgress', () => {
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/facilities\/.*\/amendments\/in-progress$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getAmendmentInProgress(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getAmendmentInProgress(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentInProgress(validFacilityId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getCompletedAmendment', () => {
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/facilities\/.*\/amendments\/completed$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getCompletedAmendment(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getCompletedAmendment(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getCompletedAmendment(validFacilityId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getLatestCompletedAmendmentValue', () => {
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/facilities\/.*\/amendments\/completed\/latest-value$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getLatestCompletedAmendmentValue(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getLatestCompletedAmendmentValue(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getLatestCompletedAmendmentValue(validFacilityId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getLatestCompletedAmendmentDate', () => {
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/facilities\/.*\/amendments\/completed\/latest-cover-end-date$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getLatestCompletedAmendmentDate(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getLatestCompletedAmendmentDate(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getLatestCompletedAmendmentDate(validFacilityId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getAmendmentById', () => {
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/facilities\/.*\/amendments\/.*$/;
    mockAxios.onGet(url).reply(200, mockResponse);
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

  describe('getAmendmentsByFacilityId', () => {
    mockAxios.reset();
    const mockResponse = 'Mock amendments';
    const url = /^.*\/v1\/facilities\/.*\/amendments$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getAmendmentsByFacilityId(urlTraversal, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.getAmendmentsByFacilityId(localIp, 'mock token');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentsByFacilityId(validFacilityId, 'mock token');

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('getAmendmentsByDealId', () => {
    mockAxios.reset();
    const mockResponse = 'Mock amendments';
    const url = /^.*\/v1\/deals\/.*\/amendments$/;
    mockAxios.onGet(url).reply(200, mockResponse);
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
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/deals\/.*\/amendments\/in-progress$/;
    mockAxios.onGet(url).reply(200, mockResponse);
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
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/deals\/.*\/amendments\/completed$/;
    mockAxios.onGet(url).reply(200, mockResponse);
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
    mockAxios.reset();
    const mockResponse = 'Mock amendment';
    const url = /^.*\/v1\/deals\/.*\/amendments\/completed\/latest$/;
    mockAxios.onGet(url).reply(200, mockResponse);
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
    mockAxios.reset();
    const mockResponse = 'Mock party';
    const url = /^.*\/v1\/party\/urn\/.*$/;
    mockAxios.onGet(url).reply(200, mockResponse);
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
