const api = require('./api');

describe('API is protected against SSRF attacks', () => {
    it('Returns an error when a url traversal is supplied', async () => {
        const urlTraversal = '../../../etc/stealpassword';
        const expectedResponse = { status: 400, data: 'Invalid party urn' };
  
        const response = await api.getParty(urlTraversal);
  
        expect(response).toMatchObject(expectedResponse);
      });
});
