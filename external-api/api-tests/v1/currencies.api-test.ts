import { app } from '../../server/createApp';
import { api } from '../api';

const { get } = api(app);

const usd = {
  currencyId: 37,
  text: 'USD - US Dollars',
  id: 'USD',
};

describe('/currencies', () => {
  describe('GET /currencies', () => {
    it('should return a list of currencies, alphabetised', async () => {
      const { status, body } = await get('/currencies');

      expect(status).toEqual(200);
      expect(body.currencies.length).toBeGreaterThan(1);
      for (let index = 1; index < body.currencies.length; index += 1) {
        expect(body.currencies[index - 1].id < body.currencies[index].id).toEqual(true);
      }
    });
  });

  describe('GET /currencies/:id', () => {
    it('should return a currency', async () => {
      const { status, body } = await get('/currencies/USD');

      expect(status).toEqual(200);
      expect(body).toMatchObject(usd);
    });

    it('should return a 404 when country does not exist', async () => {
      const { status } = await get('/currencies/123');

      expect(status).toEqual(404);
    });
  });
});
