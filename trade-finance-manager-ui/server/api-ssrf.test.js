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
});
