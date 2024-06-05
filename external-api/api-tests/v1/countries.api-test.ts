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

describe('/countries', () => {
  const gbr = {
    id: 826,
    name: 'United Kingdom',
    code: 'GBR',
  };

  describe('GET /countries', () => {
    it('returns a list of countries, alphabetised but with GBR/United Kingdom at the top', async () => {
      const { status, body } = await get('/countries');

      expect(status).toEqual(200);
      expect(body.countries.length).toBeGreaterThan(1);
      expect(body.countries[0]).toEqual(gbr);

      for (let i = 2; i < body.countries.length; i += 1) {
        expect(body.countries[i - 1].name < body.countries[i].name).toBe(true);
      }
    });
  });

  describe('GET /v1/countries/:code', () => {
    it('returns country', async () => {
      const { status, body } = await get('/countries/GBR');

      expect(status).toEqual(200);
      expect(body).toEqual(gbr);
    });

    it('returns 404 when country does not exist', async () => {
      const { status } = await get('/countries/123');

      expect(status).toEqual(404);
    });
  });
});
