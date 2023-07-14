import { app } from '../../src/createApp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { get } = require('../api')(app);

const mockResponse = { status: 200, data: 'mock response' };

jest.mock('axios', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('/party-db', () => {
  describe('GET /party-db', () => {
    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get('/party-db/03827491');

      expect(status).toEqual(200);
    });

    it('returns a 400 if you provide an invalid companies registration number', async () => {
      const { status, body } = await get('/party-db/abc');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid company registration number', status: 400 });
    });

    it('returns a 400 if you provide a malicious companies registration number', async () => {
      const { status, body } = await get('/party-db/127.0.0.1');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid company registration number', status: 400 });
    });

    it('returns a 400 if you provide an object as the companies registration number', async () => {
      const { status, body } = await get('/party-db/{}');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid company registration number', status: 400 });
    });

    it('returns a 400 if you provide an array as the companies registration number', async () => {
      const { status, body } = await get('/party-db/[]');

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid company registration number', status: 400 });
    });
  });
});
