const api = require('../src/v1/api');
const axios = require('axios');
var MockAdapter = require('axios-mock-adapter');
const mockAxios = new MockAdapter(axios);

describe('API is protected against SSRF attacks', () => {

  beforeEach(() => {
    mockAxios.reset();
  });

  describe('findOnePortalDeal', () => {
    const mockResponse = {
      deal: 'Mock deal',
    };
    const url = /^.*\/v1\/portal\/deals\/.*$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOnePortalDeal(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOnePortalDeal(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.findOnePortalDeal(validDealId);

      expect(response).toEqual(mockResponse.deal);
    });
  });

  describe('updatePortalDeal', () => {
    const mockResponse = 'Mock deal';
    const url = /^.*\/v1\/portal\/deals\/.*$/;
    mockAxios.onPut(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updatePortalDeal(urlTraversal, { deal: 'Mock deal' });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updatePortalDeal(localIp, { deal: 'Mock deal' });

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.updatePortalDeal(validDealId, { deal: 'Mock deal' });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updatePortalBssDealStatus', () => {
    const mockResponse = 'Mock status';
    const url = /^.*\/v1\/portal\/deals\/.*\/status$/;
    mockAxios.onPut(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updatePortalBssDealStatus(urlTraversal, 'Mock status');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updatePortalBssDealStatus(localIp, 'Mock status');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.updatePortalBssDealStatus(validDealId, 'Mock status');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('addPortalDealComment', () => {
    const mockResponse = 'Mock comment';
    const url = /^.*\/v1\/portal\/deals\/.*\/comment$/;
    mockAxios.onPost(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.addPortalDealComment(urlTraversal, 'mock', 'mock');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.addPortalDealComment(localIp, 'mock', 'mock');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.addPortalDealComment(validDealId, 'mock', 'mock');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updatePortalFacilityStatus', () => {
    const mockResponse = 'Mock status';
    const url = /^.*\/v1\/portal\/facilities\/.*\/status$/;
    mockAxios.onPut(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updatePortalFacilityStatus(urlTraversal, 'Mock status');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updatePortalFacilityStatus(localIp, 'Mock status');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.updatePortalFacilityStatus(validFacilityId, 'Mock status');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findOneDeal', () => {
    const mockResponse = { deal: 'Mock deal' };
    const url = /^.*\/v1\/tfm\/deals\/.*$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOneDeal(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOneDeal(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.findOneDeal(validDealId);

      expect(response).toEqual(mockResponse.deal);
    });
  });

  describe('updateDeal', () => {
    const mockResponse = 'Mock deal';
    const url = /^.*\/v1\/tfm\/deals\/.*$/;
    mockAxios.onPut(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDeal(urlTraversal, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDeal(localIp, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.updateDeal(validFacilityId, 'Mock update');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateDealSnapshot', () => {
    const mockResponse = 'Mock deal';
    const url = /^.*\/v1\/tfm\/deals\/.*\/snapshot$/;
    mockAxios.onPut(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDealSnapshot(urlTraversal, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.updateDealSnapshot(localIp, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.updateDealSnapshot(validDealId, 'Mock update');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findOneFacility', () => {
    const mockResponse = 'Mock facility';
    const url = /^.*\/v1\/tfm\/facilities\/.*$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.findOneFacility(urlTraversal, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.findOneFacility(localIp, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.findOneFacility(validFacilityId, 'Mock update');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findFacilitesByDealId', () => {
    const mockResponse = 'Mock facilities';
    const url = /^.*\/v1\/tfm\/deals\/.*\/facilities$/;
    mockAxios.onGet(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findFacilitesByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findFacilitesByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.findFacilitesByDealId(validDealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateFacility', () => {
    const mockResponse = 'Mock facility';
    const url = /^.*\/v1\/tfm\/facilities\/.*$/;
    mockAxios.onPut(url).reply(200, mockResponse);
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updateFacility(urlTraversal, 'mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.updateFacility(localIp, 'mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.updateFacility(validFacilityId, 'mock update');

      expect(response).toEqual(mockResponse);
    });
  });


});
