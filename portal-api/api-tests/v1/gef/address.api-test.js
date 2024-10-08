const { HttpStatusCode } = require('axios');
const { ADDRESSES } = require('@ukef/dtfs2-common');
const app = require('../../../src/createApp');
const { MAKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { POSTCODE } = require('../../fixtures/postcode');

const { as, get } = require('../../api')(app);

jest.unmock('../../../src/external-api/api');

const baseUrl = '/v1/gef';

describe('GET /v1/gef/address/:postcode', () => {
  const aPostcodeAddressUrl = `${baseUrl}/address/${POSTCODE.VALID}`;
  let testUsers;
  let aMaker;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(aPostcodeAddressUrl),
    makeRequestWithAuthHeader: (authHeader) => get(aPostcodeAddressUrl, { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [MAKER, READ_ONLY, ADMIN],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(aPostcodeAddressUrl),
    successStatusCode: 200,
  });

  it('Returns a list of addresses', async () => {
    const { status, body } = await as(aMaker).get(`${baseUrl}/address/${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`);
    expect(status).toEqual(HttpStatusCode.Ok);
    expect(body[0]).toEqual({
      organisationName: expect.any(String),
      addressLine1: expect.any(String),
      addressLine2: null,
      addressLine3: null,
      country: expect.any(String),
      locality: expect.any(String),
      postalCode: expect.any(String),
    });
  });

  it('Returns a not found address if the postcode was not found', async () => {
    const { status, body } = await as(aMaker).get(`${baseUrl}/address/${ADDRESSES.EXAMPLES.POSTCODE_UNPROCESSABLE}`);
    expect(status).toEqual(HttpStatusCode.UnprocessableEntity);
    expect(body).toEqual([
      {
        status: HttpStatusCode.UnprocessableEntity,
        errMsg: {},
        errCode: 'ERROR',
        errRef: 'postcode',
      },
    ]);
  });

  it('Returns an invalid postcode error, if the postcode specified is invalid', async () => {
    const { status, body } = await as(aMaker).get(`${baseUrl}/address/A1`);
    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(body).toEqual([
      {
        status: HttpStatusCode.BadRequest,
        errMsg: 'Invalid postcode',
        errCode: 'ERROR',
        errRef: 'postcode',
      },
    ]);
  });

  it('returns a 422 response if backend returns 500', async () => {
    const { status, body } = await as(aMaker).get(`${baseUrl}/address/${ADDRESSES.EXAMPLES.POSTCODE_UNPROCESSABLE}`);

    expect(status).toEqual(HttpStatusCode.UnprocessableEntity);
    expect(body).toEqual([
      {
        status: HttpStatusCode.UnprocessableEntity,
        errMsg: {},
        errCode: 'ERROR',
        errRef: 'postcode',
      },
    ]);
  });
});
