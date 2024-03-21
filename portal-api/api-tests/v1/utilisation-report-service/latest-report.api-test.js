const { UtilisationReportEntityMockBuilder, UTILISATION_REPORT_RECONCILIATION_STATUS } = require('@ukef/dtfs2-common');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { SqlDbHelper } = require('../../sql-db-helper');

describe('GET /v1/banks/:bankId/utilisation-reports/latest', () => {
  const latestReportUrl = (bankId) => `/v1/banks/${bankId}/utilisation-reports/latest`;
  let aPaymentReportOfficer;
  let mockUtilisationReports;
  let testUsers;
  let matchingBankId;
  let expectedReportResponse;

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    const bankId = aPaymentReportOfficer.bank.id;
    const uploadedByUserId = aPaymentReportOfficer._id.toString();

    const year = 2023;
    mockUtilisationReports = [
      UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
        .withBankId(bankId)
        .withUploadedByUserId(uploadedByUserId)
        .withReportPeriod({
          start: { month: 1, year },
          end: { month: 1, year },
        })
        .withDateUploaded(new Date('2023-01-01'))
        .build(),
      UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
        .withBankId(bankId)
        .withUploadedByUserId(uploadedByUserId)
        .withReportPeriod({
          start: { month: 2, year },
          end: { month: 2, year },
        })
        .withDateUploaded(new Date('2023-02-01'))
        .build(),
    ];
    await SqlDbHelper.saveNewEntries('UtilisationReport', mockUtilisationReports);

    const latestMockReport = mockUtilisationReports.at(-1);
    expectedReportResponse = {
      reportPeriod: latestMockReport.reportPeriod,
      dateUploaded: latestMockReport.dateUploaded.toISOString(),
      path: latestMockReport.azureFileInfo.fullPath,
    };
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(latestReportUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(latestReportUrl(matchingBankId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
    makeRequestAsUser: (user) => as(user).get(latestReportUrl(matchingBankId)),
    successStatusCode: 200,
  });

  it('400s requests that do not have a valid bank id', async () => {
    const { status } = await as(aPaymentReportOfficer).get(latestReportUrl('620a1aa095a618b12da38c7b'));

    expect(status).toEqual(400);
  });

  it('401s requests if users bank != request bank', async () => {
    const { status } = await as(aPaymentReportOfficer).get(latestReportUrl(matchingBankId - 1));

    expect(status).toEqual(401);
  });

  it('returns the requested resource', async () => {
    const response = await as(aPaymentReportOfficer).get(latestReportUrl(matchingBankId));

    expect(response.status).toEqual(200);
    expect(JSON.parse(response.text)).toEqual(expect.objectContaining(expectedReportResponse));
  });
});
