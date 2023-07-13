const axios = require('axios');
// eslint-disable-next-line import/no-extraneous-dependencies
const MockAdapter = require('axios-mock-adapter');
const api = jest.requireActual('../src/v1/api');

const mockAxios = new MockAdapter(axios);

describe('API is protected against SSRF attacks', () => {

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
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/deals\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

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
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/deals\/.*\/status$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

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
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/deals\/.*\/comment$/;
      mockAxios.onPost(url).reply(200, mockResponse);
    });

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
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/facilities\/.*\/status$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

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

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.updatePortalFacilityStatus(validFacilityId, 'Mock status');

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
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

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
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/snapshot$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

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
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

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

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.findOneFacility(validFacilityId, 'Mock update');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('findFacilitesByDealId', () => {
    const mockResponse = 'Mock facilities';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/deals\/.*\/facilities$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

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
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

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

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.updateFacility(validFacilityId, 'mock update');

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.createFacilityAmendment(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility id' };

      const response = await api.createFacilityAmendment(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.createFacilityAmendment(validFacilityId);

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
      const urlTraversal = '../../../etc/stealpassword';
      const validAmendmentId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility Id or amendment Id provided' };

      const response = await api.updateFacilityAmendment(urlTraversal, validAmendmentId, 'Mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getAmendmentInProgress(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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

  describe('getCompletedAmendment', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*\/amendments\/completed$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getCompletedAmendment(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getCompletedAmendment(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getCompletedAmendment(validFacilityId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getLatestCompletedAmendmentValue', () => {
    const mockResponse = 'Mock value';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*\/amendments\/completed\/latest-value$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getLatestCompletedAmendmentValue(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getLatestCompletedAmendmentValue(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getLatestCompletedAmendmentValue(validFacilityId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('getLatestCompletedAmendmentDate', () => {
    const mockResponse = 'Mock date';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*\/amendments\/completed\/latest-cover-end-date$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getLatestCompletedAmendmentDate(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getLatestCompletedAmendmentDate(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getLatestCompletedAmendmentDate(validFacilityId);

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
      const urlTraversal = '../../../etc/stealpassword';
      const validAmendmentId = '5ce819935e539c343f141ece';
      const expectedResponse = { status: 400, data: 'Invalid facility Id or amendment Id provided' };

      const response = await api.getAmendmentById(urlTraversal, validAmendmentId);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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

  describe('getAmendmentByFacilityId', () => {
    const mockResponse = 'Mock amendment';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/tfm\/facilities\/.*\/amendments$/;
      mockAxios.onGet(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getAmendmentByFacilityId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.getAmendmentByFacilityId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacilityId = '5ce819935e539c343f141ece';

      const response = await api.getAmendmentByFacilityId(validFacilityId);

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getAmendmentsByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getAmendmentsByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getAmendmentInProgressByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getAmendmentInProgressByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getCompletedAmendmentByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getCompletedAmendmentByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getLatestCompletedAmendmentByDealId(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal Id provided' };

      const response = await api.getLatestCompletedAmendmentByDealId(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.updateGefFacility(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid facility Id provided' };

      const response = await api.updateGefFacility(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the facility id is valid', async () => {
      const validFacility = '5ce819935e539c343f141ece';

      const response = await api.updateGefFacility(validFacility);

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid party urn provided' };

      const response = await api.getCompanyInfo(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.findUserById(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.findPortalUserById(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid user id provided' };

      const response = await api.updateUserTasks(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid team id provided' };

      const response = await api.findOneTeam(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid team id provided' };

      const response = await api.findOneTeam(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the team id is valid', async () => {
      const validTeamId = '5ce819935e539c343f141ece';

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid team id provided' };

      const response = await api.findTeamMembers(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid team id provided' };

      const response = await api.findTeamMembers(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the team id is valid', async () => {
      const validTeamId = '5ce819935e539c343f141ece';

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
      const urlTraversal = '../../../etc/stealpassword';
      const validCurrencyCode = 'USD';
      const expectedResponse = { status: 400, data: 'Invalid currency provided' };

      const response = await api.getCurrencyExchangeRate(urlTraversal, validCurrencyCode);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.findOneGefDeal(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.findOneGefDeal(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.findOneGefDeal(validDealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updatePortalGefDealStatus', () => {
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/deals\/.*\/status$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updatePortalGefDealStatus(urlTraversal, 'mock status');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updatePortalGefDealStatus(localIp, 'mock status');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.updatePortalGefDealStatus(validDealId, 'mock status');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updatePortalGefDeal', () => {
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/deals\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updatePortalGefDealStatus(urlTraversal, 'mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updatePortalGefDealStatus(localIp, 'mock update');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.updatePortalGefDealStatus(validDealId, 'mock update');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('updateGefMINActivity', () => {
    const mockResponse = 'Mock deal';
    beforeAll(() => {
      mockAxios.reset();
      const url = /^.*\/v1\/portal\/gef\/deals\/activity\/.*$/;
      mockAxios.onPut(url).reply(200, mockResponse);
    });

    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updateGefMINActivity(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.updateGefMINActivity(localIp);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

      const response = await api.updateGefMINActivity(validDealId);

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.addUnderwriterCommentToGefDeal(urlTraversal, 'mock comment type', 'mock comment');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id provided' };

      const response = await api.addUnderwriterCommentToGefDeal(localIp, 'mock comment type', 'mock comment');

      expect(response).toMatchObject(expectedResponse);
    });

    it('Makes an axios request when the deal id is valid', async () => {
      const validDealId = '5ce819935e539c343f141ece';

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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid bank id provided' };

      const response = await api.findBankById(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid mandatory criteria version provided' };

      const response = await api.getGefMandatoryCriteriaByVersion(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const localIp = '127.0.0.1';
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
});
