const api = require('../src/v1/api');

describe('API is protected against SSRF attacks', () => {
  describe('findOnePortalDeal', () => {
    it('Returns an error when a url traversal is supplied', async () => {
      const urlTraversal = '../../../etc/stealpassword';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOnePortalDeal(urlTraversal);

      expect(response).toMatchObject(expectedResponse);
    });

    it('Returns an error when a local IP is supplied', async () => {
      const urlTraversal = '127.0.0.1';
      const expectedResponse = { status: 400, data: 'Invalid deal id' };

      const response = await api.findOnePortalDeal(urlTraversal);
      
      expect(response).toMatchObject(expectedResponse);
    });
  });
});
