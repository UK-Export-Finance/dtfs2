/**
 * @jest-environment node
 */


const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

jest.unmock('../../../src/reference-data/api');

const mockIndustrySectorCode = '1008';

// const aaaa = anIndustrySector({ code: '100', name: 'AAAA', classes: mockClasses });
// const pppp = anIndustrySector({ code: '200', name: 'PPPP', classes: mockClasses });
// const mmmm = anIndustrySector({ code: '300', name: 'MMMM', classes: mockClasses });

// const newIndustrySector = anIndustrySector({ code: '101', name: 'AAAB', classes: mockClasses });
// const updatedIndustrySector = anIndustrySector({ code: '101', name: 'BBBA', classes: mockClasses });

describe('/v1/industry-sectors', () => {
  let noRoles;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
  });

  describe('GET /v1/industry-sectors', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/industry-sectors');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/industry-sectors');

      expect(status).toEqual(200);
    });

    it('returns a list of industry-sectors', async () => {
      const { status, body } = await as(noRoles).get('/v1/industry-sectors');

      expect(status).toEqual(200);

      expect(body.industrySectors.length).toBeGreaterThan(1);
      body.industrySectors.forEach((industry) => {
        expect(industry.code).toBeDefined();
        expect(industry.name).toBeDefined();
        expect(industry.classes).toBeDefined();
      });
    });
  });


  describe('GET /v1/industry-sectors/:code', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`/v1/industry-sectors/${mockIndustrySectorCode}`);

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status, body } = await as(noRoles).get(`/v1/industry-sectors/${mockIndustrySectorCode}`);

      expect(status).toEqual(200);
      expect(body.code).toBeDefined();
      expect(body.name).toBeDefined();
      expect(body.classes.length).toBeGreaterThan(0);
    });

    it('returns 404 when industry sector doesn\'t exist', async () => {
      const { status } = await as(noRoles).get('/v1/countries/1');

      expect(status).toEqual(404);
    });
  });
});
