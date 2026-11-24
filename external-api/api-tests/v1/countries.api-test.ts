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

  it('should return all countries marked disabled', async () => {
    const disabledCountries = [
      { id: 4, name: 'Afghanistan', code: 'AFG' },
      { id: 112, name: 'Belarus', code: 'BLR' },
      { id: 204, name: 'Benin', code: 'BEN' },
      { id: 70, name: 'Bosnia and Herzegovina', code: 'BIH' },
      { id: 854, name: 'Burkina Faso', code: 'BFA' },
      { id: 104, name: 'Burma or Myanmar', code: 'MMR' },
      { id: 108, name: 'Burundi', code: 'BDI' },
      { id: 132, name: 'Cape Verde', code: 'CPV' },
      { id: 140, name: 'Central African Republic', code: 'CAF' },
      { id: 156, name: 'China', code: 'CHN' },
      { id: 178, name: 'Congo', code: 'COG' },
      { id: 935, name: 'Congo, Democratic Republic of', code: 'COD' },
      { id: 384, name: 'Cote d Ivoire', code: 'CIV' },
      { id: 270, name: 'Gambia', code: 'GMB' },
      { id: 288, name: 'Ghana', code: 'GHA' },
      { id: 324, name: 'Guinea', code: 'GIN' },
      { id: 624, name: 'Guinea Bissau', code: 'GNB' },
      { id: 332, name: 'Haiti', code: 'HTI' },
      { id: 344, name: 'Hong Kong', code: 'HKG' },
      { id: 364, name: 'Iran', code: 'IRN' },
      { id: 368, name: 'Iraq', code: 'IRQ' },
      { id: 408, name: 'Korea, Democratic Peoples Republic of', code: 'PRK' },
      { id: 422, name: 'Lebanon', code: 'LBN' },
      { id: 430, name: 'Liberia', code: 'LBR' },
      { id: 434, name: 'Libya', code: 'LBY' },
      { id: 466, name: 'Mali', code: 'MLI' },
      { id: 558, name: 'Nicaragua', code: 'NIC' },
      { id: 562, name: 'Niger', code: 'NER' },
      { id: 566, name: 'Nigeria', code: 'NGA' },
      { id: 275, name: 'Palestinian National Authority', code: 'PSE' },
      { id: 643, name: 'Russian Federation', code: 'RUS' },
      { id: 686, name: 'Senegal', code: 'SEN' },
      { id: 694, name: 'Sierra Leone', code: 'SLE' },
      { id: 706, name: 'Somalia', code: 'SOM' },
      { id: 736, name: 'Sudan', code: 'SDN' },
      { id: 760, name: 'Syrian Arab Republic', code: 'SYR' },
      { id: 768, name: 'Togo', code: 'TGO' },
      { id: 862, name: 'Venezuela', code: 'VEN' },
      { id: 732, name: 'Western Sahara', code: 'ESH' },
      { id: 887, name: 'Yemen', code: 'YEM' },
      { id: 716, name: 'Zimbabwe', code: 'ZWE' },
    ];

    const { status, body } = await get('/countries');

    expect(status).toEqual(200);

    expect(body.countries).toBeInstanceOf(Array);

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
