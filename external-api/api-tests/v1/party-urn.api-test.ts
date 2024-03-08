import { app } from '../../src/createApp';
import { api } from '../api';

const { get } = api(app);

const mockResponse = { status: 200, data: 'mock response' };

jest.mock('axios', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('/party-db/urn', () => {
  describe('GET /party-db/urn', () => {
    it('returns a 200 response with a valid party urn', async () => {
      const { status } = await get('/party-db/urn/03827491');

      expect(status).toEqual(200);
    });
  });

  const invalidPartyUrnTestCases = [['123'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when party urn is invalid', () => {
    test.each(invalidPartyUrnTestCases)('returns a 400 if you provide an invalid party urn: %o', async (partyUrn) => {
      const { status, body } = await get(`/party-db/urn/${partyUrn}`);

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid party URN', status: 400 });
    });
  });
});
