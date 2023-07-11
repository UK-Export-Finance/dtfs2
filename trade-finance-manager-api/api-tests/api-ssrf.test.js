const api = require('../src/v1/api');
const axios = require('axios');
var MockAdapter = require('axios-mock-adapter');
const mockAxios = new MockAdapter(axios);

describe('API is protected against SSRF attacks', () => {
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

      expect(response).toEqual('Mock deal');
    });
  });

  describe('updatePortalDeal', () => {
    const mockResponse = 'Mock deal'
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

      expect(response).toEqual('Mock deal');
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

      expect(response).toEqual('Mock status');
    });
  });
});
