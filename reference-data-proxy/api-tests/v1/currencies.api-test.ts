import { app } from '../../src/createApp';
const { get } = require('../api')(app);

const usd = {
  currencyId: 37,
  text: 'USD - US Dollars',
  id: 'USD',
};

describe('/currencies', () => {
  describe('GET /currencies', () => {
    it('returns a list of currencies, alphebetized', async () => {
      const { status, body } = await get('/currencies');

      expect(status).toEqual(200);
      expect(body.currencies.length).toBeGreaterThan(1);
      for (let i = 1; i < body.currencies.length; i += 1) {
        expect(body.currencies[i - 1].id < body.currencies[i].id).toBeTruthy();
      }
    });
  });

  describe('GET /currencies/:id', () => {
    it('returns a currency', async () => {
      const { status, body } = await get('/currencies/USD');

      expect(status).toEqual(200);
      expect(body).toMatchObject(usd);
    });

    it('returns 404 when country doesn\t exist', async () => {
      const { status } = await get('/currencies/123');

      expect(status).toEqual(404);
    });
  });
});
