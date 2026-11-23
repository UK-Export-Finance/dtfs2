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
    const disabledCountries = [
      'Afghanistan',
      'Belarus',
      'Benin',
      'Bosnia and Herzegovina',
      'Burkina Faso',
      'Burma or Myanmar',
      'Burundi',
      'Cape Verde',
      'Central African Republic',
      'China',
      'Congo',
      'Congo, Democratic Republic of',
      'Cote d Ivoire',
      'Gambia',
      'Ghana',
      'Guinea',
      'Guinea Bissau',
      'Haiti',
      'Hong Kong',
      'Iran',
      'Iraq',
      'Korea, Democratic Peoples Republic of',
      'Lebanon',
      'Liberia',
      'Libya',
      'Mali',
      'Nicaragua',
      'Niger',
      'Nigeria',
      'Palestinian National Authority',
      'Russian Federation',
      'Senegal',
      'Sierra Leone',
      'Somalia',
      'Sudan',
      'Syrian Arab Republic',
      'Togo',
      'Venezuela',
      'Western Sahara',
      'Yemen',
      'Zimbabwe',
    ];

    const { status, body } = await get('/countries');

    expect(status).toEqual(200);

    expect(body.countries).toBeInstanceOf(Array);

    disabledCountries.forEach((countryname) => {
      expect(body.countries).toContainEqual(
        expect.objectContaining({
          name: countryname,
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
