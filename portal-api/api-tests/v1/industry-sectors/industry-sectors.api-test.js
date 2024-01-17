/**
 * @jest-environment node
 */

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withNoRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const { as, get } = require('../../api')(app);
const { MAKER } = require('../../../src/v1/roles/roles');

jest.unmock('../../../src/external-api/api');

const mockIndustrySectorCode = '1008';

describe('/v1/industry-sectors', () => {
  let noRoles;
  let aBarclaysMaker;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
  });

  describe('GET /v1/industry-sectors', () => {
    const industrySectorsUrl = '/v1/industry-sectors';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(industrySectorsUrl),
      makeRequestWithAuthHeader: (authHeader) => get(industrySectorsUrl, { headers: { Authorization: authHeader } }),
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(industrySectorsUrl),
      successStatusCode: 200,
    });

    it('returns a list of industry-sectors', async () => {
      const { status, body } = await as(aBarclaysMaker).get(industrySectorsUrl);

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
    const mockIndustrySectorUrl = `/v1/industry-sectors/${mockIndustrySectorCode}`;

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(mockIndustrySectorUrl),
      makeRequestWithAuthHeader: (authHeader) => get(mockIndustrySectorUrl, { headers: { Authorization: authHeader } }),
    });

    withNoRoleAuthorisationTests({
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(mockIndustrySectorUrl),
      successStatusCode: 200,
    });

    it('returns an industry sector', async () => {
      const { status, body } = await as(noRoles).get(`/v1/industry-sectors/${mockIndustrySectorCode}`);

      expect(status).toEqual(200);
      expect(body.code).toBeDefined();
      expect(body.name).toBeDefined();
      expect(body.classes.length).toBeGreaterThan(0);
    });

    it("returns 404 when industry sector doesn't exist", async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/industry-sectors/11');

      expect(status).toEqual(404);
    });

    it('returns 400 when industry sector code is invalid', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/industry-sectors/ABC');

      expect(status).toEqual(400);
    });
  });
});
