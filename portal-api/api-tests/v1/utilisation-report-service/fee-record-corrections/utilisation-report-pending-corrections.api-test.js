const { HttpStatusCode } = require('axios');
const { SqlDbHelper } = require('../../../sql-db-helper.ts');
const app = require('../../../../src/createApp.js');
const { as, get } = require('../../../api.js')(app);
const testUserCache = require('../../../api-test-users.js');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests.js');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests.js');
const { PAYMENT_REPORT_OFFICER } = require('../../../../src/v1/roles/roles.js');

describe('GET /v1/banks/:bankId/utilisation-reports/pending-corrections', () => {
  const pendingCorrectionsUrl = (bankId) => `/v1/banks/${bankId}/utilisation-reports/pending-corrections`;
  let aPaymentReportOfficer;
  let testUsers;
  let matchingBankId;

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(pendingCorrectionsUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(pendingCorrectionsUrl(matchingBankId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(pendingCorrectionsUrl(matchingBankId)),
    successStatusCode: HttpStatusCode.Ok,
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} requests that do not have a valid bank id`, async () => {
    const { status } = await as(aPaymentReportOfficer).get(pendingCorrectionsUrl('620a1aa095a618b12da38c7b'));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} if user's bank does not match request bank`, async () => {
    const { status } = await as(aPaymentReportOfficer).get(pendingCorrectionsUrl(matchingBankId - 1));

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });
});
