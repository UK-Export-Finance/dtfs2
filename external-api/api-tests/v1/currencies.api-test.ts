/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { app } from '../../src/createApp';
import { api } from '../api';

const { get } = api(app);

const usd = {
  currencyId: 37,
  text: 'USD - US Dollars',
  id: 'USD',
};

describe('/currencies', () => {
  describe('GET /currencies', () => {
    it('returns a list of currencies, alphabetised', async () => {
      const { status, body } = await get('/currencies');

      expect(status).toEqual(200);
      expect(body.currencies.length).toBeGreaterThan(1);
      for (let i = 1; i < body.currencies.length; i += 1) {
        expect(body.currencies[i - 1].id < body.currencies[i].id).toBe(true);
      }
    });
  });

  describe('GET /currencies/:id', () => {
    it('returns a currency', async () => {
      const { status, body } = await get('/currencies/USD');

      expect(status).toEqual(200);
      expect(body).toMatchObject(usd);
    });

    it('returns 404 when country does not exist', async () => {
      const { status } = await get('/currencies/123');

      expect(status).toEqual(404);
    });
  });
});
