const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const app = require('../../../src/createApp');
const { MAKER } = require('../../../src/v1/roles/roles');
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

  it(`returns a ${HttpStatusCode.Ok} response with the company when it is found`, async () => {
    const { status, body } = await as(aMaker).get(`${baseUrl}/companies/${MOCK_COMPANY_REGISTRATION_NUMBERS.VALID}`);
    expect(status).toEqual(HttpStatusCode.Ok);
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

  it(`returns a ${HttpStatusCode.BadRequest} response if an invalid company registration number is provided`, async () => {
    const { status } = await as(aMaker).get(`${baseUrl}/companies/${MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT}`);
    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`returns a ${HttpStatusCode.NotFound} response when the company is not found`, async () => {
    const { status } = await as(aMaker).get(`${baseUrl}/companies/${MOCK_COMPANY_REGISTRATION_NUMBERS.VALID_NONEXISTENT}`);
    expect(status).toEqual(HttpStatusCode.NotFound);
  });

  it(`returns a ${HttpStatusCode.UnprocessableEntity} response when the company is an overseas company`, async () => {
    const { status } = await as(aMaker).get(`${baseUrl}/companies/${MOCK_COMPANY_REGISTRATION_NUMBERS.VALID_OVERSEAS}`);
    expect(status).toEqual(HttpStatusCode.UnprocessableEntity);
  });

  describe('auth tests', () => {
    const companiesGetCompanyByRegistrationNumberActual = companies.getCompanyByRegistrationNumber;
    const aCompanyNumberUrl = `${baseUrl}/companies/${MOCK_COMPANY_REGISTRATION_NUMBERS.VALID}`;

    beforeEach(() => {
      companies.getCompanyByRegistrationNumber = jest.fn();
      companies.getCompanyByRegistrationNumber.mockResolvedValueOnce({
        status: HttpStatusCode.Ok,
        data: {
          companiesHouseRegistrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
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
      allowedRoles: [MAKER],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(aCompanyNumberUrl),
      successStatusCode: HttpStatusCode.Ok,
    });
  });
});
