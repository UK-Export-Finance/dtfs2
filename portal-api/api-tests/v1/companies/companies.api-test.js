const { COMPANY_REGISTRATION_NUMBER } = require('@ukef/dtfs2-common');
const app = require('../../../src/createApp');
const { MAKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { POSTCODE } = require('../../fixtures/postcode');
const { companies } = require('../../../src/external-api/api');
const { as, get } = require('../../api')(app);

jest.unmock('../../../src/external-api/api');

describe.each([{ baseUrl: '/v1' }, { baseUrl: '/v1/gef' }])('GET $baseUrl/companies/:registrationNumber', ({ baseUrl }) => {
  let testUsers;
  let aMaker;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  it('returns a 200 response with the company when it is found', async () => {
    const { status, body } = await as(aMaker).get(`${baseUrl}/companies/${COMPANY_REGISTRATION_NUMBER.EXAMPLES.VALID}`);
    expect(status).toEqual(200);
    expect(body.companiesHouseRegistrationNumber).toEqual(expect.any(String));
    expect(body.companyName).toEqual(expect.any(String));
    expect(body.registeredAddress).toEqual({
      addressLine1: expect.any(String),
      addressLine2: expect.toBeStringOrUndefined(),
      addressLine3: expect.toBeStringOrUndefined(),
      locality: expect.any(String),
      postalCode: expect.any(String),
      country: expect.any(String),
    });
    expect(body.industries[0].code).toEqual(expect.any(String));
    expect(body.industries[0].name).toEqual(expect.any(String));
    expect(body.industries[0].class).toEqual({
      code: expect.any(String),
      name: expect.any(String),
    });
  });

  it('returns a 400 response if an invalid company registration number is provided', async () => {
    const { status } = await as(aMaker).get(`${baseUrl}/companies/${COMPANY_REGISTRATION_NUMBER.EXAMPLES.INVALID_TOO_SHORT}`);
    expect(status).toEqual(400);
  });

  it('returns a 404 response when the company is not found', async () => {
    const { status } = await as(aMaker).get(`${baseUrl}/companies/${COMPANY_REGISTRATION_NUMBER.EXAMPLES.VALID_NONEXISTENT}`);
    expect(status).toEqual(404);
  });

  it('returns a 422 response when the company is an overseas company', async () => {
    const { status } = await as(aMaker).get(`${baseUrl}/companies/${COMPANY_REGISTRATION_NUMBER.EXAMPLES.VALID_OVERSEAS}`);
    expect(status).toEqual(422);
  });

  describe('auth tests', () => {
    const companiesGetCompanyByRegistrationNumberActual = companies.getCompanyByRegistrationNumber;
    const aCompanyNumberUrl = `${baseUrl}/companies/${COMPANY_REGISTRATION_NUMBER.EXAMPLES.VALID}`;

    beforeEach(() => {
      companies.getCompanyByRegistrationNumber = jest.fn();
      companies.getCompanyByRegistrationNumber.mockResolvedValueOnce({
        status: 200,
        data: {
          companiesHouseRegistrationNumber: COMPANY_REGISTRATION_NUMBER.EXAMPLES.VALID,
          companyName: 'Test Co.',
          registeredAddress: {
            organisationName: 'Test Org',
            addressLine1: '1 Test Road',
            addressLine2: 'Test Place',
            locality: 'London',
            postalCode: POSTCODE.VALID,
            country: 'Great Britain',
          },
          industries: [],
        },
      });
    });

    afterAll(() => {
      companies.getCompanyByRegistrationNumber = companiesGetCompanyByRegistrationNumberActual;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(aCompanyNumberUrl),
      makeRequestWithAuthHeader: (authHeader) => get(aCompanyNumberUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(aCompanyNumberUrl),
      successStatusCode: 200,
    });
  });
});
