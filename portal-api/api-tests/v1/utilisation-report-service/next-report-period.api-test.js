const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { getNextReportPeriodByBankId } = require('../../../src/v1/api');

jest.mock('../../../src/v1/api');

describe('GET /v1/banks/:bankId/next-report-period', () => {
  const nextReportPeriodUrl = (bankId) => `/v1/banks/${bankId}/next-report-period`;
  let aPaymentReportOfficer;
  let testUsers;
  let matchingBankId;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(nextReportPeriodUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(nextReportPeriodUrl(matchingBankId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(nextReportPeriodUrl(matchingBankId)),
    successStatusCode: 200,
  });

  it('400s requests that do not have a valid bank id', async () => {
    const { status } = await as(aPaymentReportOfficer).get(nextReportPeriodUrl('620a1aa095a618b12da38c7b'));

    expect(status).toEqual(400);
  });

  it('401s requests if users bank != request bank', async () => {
    const { status } = await as(aPaymentReportOfficer).get(nextReportPeriodUrl(matchingBankId - 1));

    expect(status).toEqual(401);
  });

  it('returns the requested resource', async () => {
    const expectedResponse = {
      start: {
        month: 12,
        year: 2023,
      },
      end: {
        month: 2,
        year: 2024,
      },
    };
    jest.mocked(getNextReportPeriodByBankId).mockResolvedValueOnce(expectedResponse);

    const response = await as(aPaymentReportOfficer).get(nextReportPeriodUrl(matchingBankId));

    expect(response.status).toEqual(200);
    expect(JSON.parse(response.text)).toEqual(expectedResponse);
  });
});
