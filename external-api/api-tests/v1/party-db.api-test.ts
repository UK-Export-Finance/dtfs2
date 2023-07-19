import { app } from '../../src/createApp';
import { api } from '../api';

const { get } = api(app);

const mockResponse = { status: 200, data: 'mock response' };

jest.mock('axios', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('/party-db', () => {
  describe('GET /party-db', () => {
    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get('/party-db/03827491');

      expect(status).toEqual(200);
    });

    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get('/party-db/SC467044');

      expect(status).toEqual(200);
    });

    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get('/party-db/8989898');

      expect(status).toEqual(200);
    });
  });

  const invalidCompaniesHouseNumberTestCases = [['ABC22'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when company house number is invalid', () => {
    test.each(invalidCompaniesHouseNumberTestCases)('returns a 400 if you provide an invalid company house number: %s', async (companyHouseNumber) => {
      const { status, body } = await get(`/party-db/${companyHouseNumber}`);

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid company registration number', status: 400 });
    });
  });
});
