const databaseHelper = require('../../database-helper');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');

const { as, get, post, remove } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const items = require('../../fixtures/gef/eligibilityCriteria');

const baseUrl = '/v1/gef/eligibility-criteria';

describe(baseUrl, () => {
  let aMaker;
  let anAdmin;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe(['eligibility-criteria']);
  });

  describe(`GET ${baseUrl}`, () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(baseUrl),
      makeRequestWithAuthHeader: (authHeader) => get(baseUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(baseUrl),
      successStatusCode: 200,
    });
  });

  describe(`GET ${baseUrl}/latest`, () => {
    const latestEligibilityCriteriaUrl = `${baseUrl}/latest`;

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(latestEligibilityCriteriaUrl),
      makeRequestWithAuthHeader: (authHeader) => get(latestEligibilityCriteriaUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(latestEligibilityCriteriaUrl),
      successStatusCode: 200,
    });

    it('returns the latest eligibility-criteria version', async () => {
      await as(anAdmin).post(items[0]).to(baseUrl);
      await as(anAdmin).post(items[1]).to(baseUrl);
      await as(anAdmin).post(items[2]).to(baseUrl);

      const { body } = await as(aMaker).get(latestEligibilityCriteriaUrl);

      expect(body).toEqual(expect.objectContaining({
        ...expectMongoId(items[1]),
        createdAt: expect.any(Number),
        criteria: expect.any(Array),
      }));
    });
  });

  describe(`GET ${baseUrl}/:version`, () => {
    const eligibilityCriteria1Url = `${baseUrl}/2.1`;

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(eligibilityCriteria1Url),
      makeRequestWithAuthHeader: (authHeader) => get(eligibilityCriteria1Url, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(eligibilityCriteria1Url),
      successStatusCode: 200,
    });

    it('returns a 404 if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(404);
    });

    it('returns an eligibility criteria', async () => {
      await as(anAdmin).post(items[0]).to(baseUrl);
      const { status, body } = await as(anAdmin).get(`${baseUrl}/${items[0].version}`);
      expect(status).toEqual(200);
      const expected = {
        ...expectMongoId(items[0]),
        version: items[0].version,
        isInDraft: expect.any(Boolean),
        createdAt: expect.any(Number),
        criteria: expect.any(Array),
      };
      expect(body).toEqual(expected);
    });
  });

  describe(`POST ${baseUrl}`, () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => post(baseUrl, items[0]),
      makeRequestWithAuthHeader: (authHeader) => post(baseUrl, items[0], { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).post(items[0]).to(baseUrl),
      successStatusCode: 201,
    });
  });

  describe(`DELETE ${baseUrl}/:version`, () => {
    const eligibilityCriteria1Url = `${baseUrl}/2.1`;

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(eligibilityCriteria1Url),
      makeRequestWithAuthHeader: (authHeader) => remove(eligibilityCriteria1Url, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).remove(eligibilityCriteria1Url),
      successStatusCode: 200,
    });

    it('deletes the eligibility-criteria', async () => {
      await as(anAdmin).post(items[0]).to(baseUrl);
      const { body: item } = await as(anAdmin).get(`${baseUrl}/${items[0].version}`);

      const { status, body } = await as(anAdmin).remove(`${baseUrl}/${items[0].version}`);
      expect(status).toEqual(200);
      expect(body).toEqual(item);
    });
  });
});
