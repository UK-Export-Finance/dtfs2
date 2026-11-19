import { COUNTRIES } from '@ukef/dtfs2-common';
import { app } from '@ukef/external-api/server/createApp';
import { api } from '@ukef/external-api/api-tests/api';

const { get } = api(app);

describe('/countries', () => {
  const gbr = {
    id: 826,
    name: 'United Kingdom',
    code: 'GBR',
  };

  describe('GET /countries', () => {
    it('should return a list of countries, alphabetised but with GBR/United Kingdom at the top', async () => {
      const { status, body } = await get('/countries');

      expect(status).toEqual(200);
      expect(body.countries.length).toBeGreaterThan(1);
      expect(body.countries[0]).toEqual(gbr);

      for (let i = 2; i < body.countries.length; i += 1) {
        expect(body.countries[i - 1].name < body.countries[i].name).toEqual(true);
      }
    });
  });

  it('should return previously excluded countries and all countries marked disabled', async () => {
    const previouslyExcludedCountries = [
      'Benin',
      'Cape Verde',
      'China',
      'Gambia',
      'Ghana',
      'Hong Kong',
      'Cote d Ivoire',
      'Liberia',
      'Nigeria',
      'Senegal',
      'Sierra Leone',
      'Togo',
    ];

    const { status, body } = await get('/countries');
    const disabledCountries = COUNTRIES.filter((country) => country.disabled);

    expect(status).toEqual(200);

    previouslyExcludedCountries.forEach((name) => {
      expect(body.countries).toContainEqual(
        expect.objectContaining({
          name,
        }),
      );
    });

    disabledCountries.forEach((country) => {
      expect(body.countries).toContainEqual(
        expect.objectContaining({
          id: country.id,
          name: country.name,
          code: country.code,
          disabled: true,
        }),
      );
    });
  });

  describe('GET /v1/countries/:code', () => {
    it('should return a country', async () => {
      const { status, body } = await get('/countries/GBR');

      expect(status).toEqual(200);
      expect(body).toEqual(gbr);
    });

    it('should return a 404 when country does not exist', async () => {
      const { status } = await get('/countries/123');

      expect(status).toEqual(404);
    });
  });
});
