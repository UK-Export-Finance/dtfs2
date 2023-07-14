import { app } from '../../src/createApp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { get } = require('../api')(app);

const mockResponse = { status: 200, data: 'mock response' };

jest.mock('axios', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('/party-db/urn', () => {
  describe('GET /party-db/urn', () => {
    it('returns a 200 response with a valid party urn', async () => {
      const { status } = await get('/party-db/urn/03827491');

      expect(status).toEqual(200);
    });

    it('returns a 400 if you provide an invalid party urn', async () => {
      const { status, body } = await get('/party-db/urn/abc');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid party URN', status: 400 });
    });

    it('returns a 400 if you provide a malicious party urn', async () => {
      const { status, body } = await get('/party-db/urn/127.0.0.1');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid party URN', status: 400 });
    });

    it('returns a 400 if you provide an object as the party urn', async () => {
      const { status, body } = await get('/party-db/urn/{}');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid party URN', status: 400 });
    });

    it('returns a 400 if you provide an array as the party urn', async () => {
      const { status, body } = await get('/party-db/urn/[]');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid party URN', status: 400 });
    });
  });
});
