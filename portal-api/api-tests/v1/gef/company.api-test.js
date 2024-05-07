const app = require('../../../src/createApp');
const { MAKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { COMPANIES_HOUSE_NUMBER } = require('../../fixtures/companies-house-number');
const { POSTCODE } = require('../../fixtures/postcode');
const { companiesHouse } = require('../../../src/external-api/api');

const { as, get } = require('../../api')(app);

describe('GET /v1/gef/company/:number', () => {
  const aCompanyNumberUrl = `/v1/gef/company/${COMPANIES_HOUSE_NUMBER.VALID}`;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
  });

  beforeEach(() => {
    companiesHouse.getCompanyProfileByCompanyRegistrationNumber = jest.fn();
    companiesHouse.getCompanyProfileByCompanyRegistrationNumber.mockResolvedValueOnce({
      data: {
        sic_codes: [],
        company_number: COMPANIES_HOUSE_NUMBER.VALID,
        company_name: 'Test Co.',
        registered_office_address: {
          organisation_name: 'Test Org',
          address_line_1: '1 Test Road',
          address_line_2: 'Test Place',
          locality: 'London',
          postal_code: POSTCODE.VALID,
          country: 'Great Britain',
        },
      },
    });
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
