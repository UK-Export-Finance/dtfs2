const { HttpStatusCode } = require('axios');
const app = require('../../../src/createApp');
const { MAKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { POSTCODE } = require('../../fixtures/postcode');

const { as, get } = require('../../api')(app);

jest.unmock('../../../src/external-api/api');

const baseUrl = '/v1/gef';

describe(`GET ${baseUrl}/address/:postcode (Ordnance Survey)`, () => {
  let testUsers;
  let aMaker;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  it('Returns a list of addresses', async () => {
    const { status, body } = await as(aMaker).get(`${baseUrl}/address/SW1A2HQ`);
    expect(status).toEqual(HttpStatusCode.Ok);
    expect(body[0]).toEqual({
      organisationName: expect.any(String),
      addressLine1: expect.any(String),
      addressLine2: null,
      addressLine3: null,
      country: null,
      locality: expect.any(String),
      postalCode: expect.any(String),
    });
  });

  it('Returns a not found address if the postcode was not found', async () => {
    const { status, body } = await as(aMaker).get(`${baseUrl}/address/AA11AA`);
    expect(status).toEqual(HttpStatusCode.UnprocessableEntity);
    expect(body).toEqual([
      {
        status: HttpStatusCode.UnprocessableEntity,
        errCode: 'ERROR',
        errRef: 'postcode',
      },
    ]);
  });

  it('Returns a not found address if the postcode was invalid', async () => {
    const { status } = await as(aMaker).get(`${baseUrl}/address/A1`);
    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  describe('auth tests', () => {
    const ordnanceSurveyGetAddressesByPostcodeActual = ordnanceSurvey.getAddressesByPostcode;
    const aPostcodeAddressUrl = `${baseUrl}/address/${POSTCODE.VALID}`;

    beforeEach(() => {
      ordnanceSurvey.getAddressesByPostcode = jest.fn();
      ordnanceSurvey.getAddressesByPostcode.mockResolvedValueOnce({ data: { results: [] } });
    });

    afterAll(() => {
      ordnanceSurvey.getAddressesByPostcode = ordnanceSurveyGetAddressesByPostcodeActual;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(aPostcodeAddressUrl),
      makeRequestWithAuthHeader: (authHeader) => get(aPostcodeAddressUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(aPostcodeAddressUrl),
      successStatusCode: HttpStatusCode.Ok,
    });
  });
});
