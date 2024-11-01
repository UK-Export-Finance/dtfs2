const { UTILISATION_REPORT_STATUS, UtilisationReportEntityMockBuilder } = require('@ukef/dtfs2-common');
const { SqlDbHelper } = require('../../sql-db-helper.ts');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');

describe('GET /v1/banks/:bankId/due-report-periods', () => {
  const dueReportPeriodsUrl = (bankId) => `/v1/banks/${bankId}/due-report-periods`;
  let aPaymentReportOfficer;
  let mockUtilisationReport;
  let testUsers;
  let matchingBankId;

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    const { bank } = aPaymentReportOfficer;
    const month = 11;
    const year = 2022;
    mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED)
      .withReportPeriod({
        start: {
          month,
          year,
        },
        end: {
          month,
          year,
        },
      })
      .withBankId(bank.id)
      .build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', mockUtilisationReport);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(dueReportPeriodsUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(dueReportPeriodsUrl(matchingBankId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(dueReportPeriodsUrl(matchingBankId)),
    successStatusCode: 200,
  });

  it('400s requests that do not have a valid bank id', async () => {
    const { status } = await as(aPaymentReportOfficer).get(dueReportPeriodsUrl('620a1aa095a618b12da38c7b'));

    expect(status).toEqual(400);
  });

  it('401s requests if users bank != request bank', async () => {
    const { status } = await as(aPaymentReportOfficer).get(dueReportPeriodsUrl(matchingBankId - 1));

    expect(status).toEqual(401);
  });

  it('returns the requested resource', async () => {
    const response = await as(aPaymentReportOfficer).get(dueReportPeriodsUrl(matchingBankId));

    expect(response.status).toEqual(200);
    expect(JSON.parse(response.text)).toEqual([mockUtilisationReport.reportPeriod]);
  });
});
