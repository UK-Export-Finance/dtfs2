const { UtilisationReportEntityMockBuilder, UTILISATION_REPORT_STATUS } = require('@ukef/dtfs2-common');
const { SqlDbHelper } = require('../../sql-db-helper.ts');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');

console.error = jest.fn();

describe('GET /v1/banks/:bankId/utilisation-reports', () => {
  const previousReportsUrl = (bankId) => `/v1/banks/${bankId}/utilisation-reports`;
  let aPaymentReportOfficer;
  let testUsers;
  let bankId;
  const receivedReportIds = [123, 124];

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    bankId = aPaymentReportOfficer.bank.id;

    const year = 2023;
    const uploadedByUserId = aPaymentReportOfficer._id;

    const aReceivedReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION)
      .withBankId(bankId)
      .withId(receivedReportIds[0])
      .withReportPeriod({
        start: {
          month: 1,
          year,
        },
        end: {
          month: 1,
          year,
        },
      })
      .withDateUploaded(new Date(`${year}-01`))
      .withUploadedByUserId(uploadedByUserId)
      .build();

    const aNotReceivedReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED)
      .withId(8)
      .withBankId(bankId)
      .withReportPeriod({
        start: {
          month: 2,
          year,
        },
        end: {
          month: 2,
          year,
        },
      })
      .build();

    const aReconciliationCompletedReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED)
      .withBankId(bankId)
      .withId(receivedReportIds[1])
      .withReportPeriod({
        start: {
          month: 3,
          year,
        },
        end: {
          month: 3,
          year,
        },
      })
      .withDateUploaded(new Date(`${year}-03`))
      .withUploadedByUserId(uploadedByUserId)
      .build();

    await SqlDbHelper.saveNewEntries('UtilisationReport', [aReceivedReport, aNotReceivedReport, aReconciliationCompletedReport]);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(previousReportsUrl(bankId)),
    makeRequestWithAuthHeader: (authHeader) => get(previousReportsUrl(bankId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(previousReportsUrl(bankId)),
    successStatusCode: 200,
  });

  it('400s requests that do not have a valid bank id', async () => {
    const { status } = await as(aPaymentReportOfficer).get(previousReportsUrl('620a1aa095a618b12da38c7b'));

    expect(status).toEqual(400);
  });

  it('401s requests if users bank != request bank', async () => {
    const { status } = await as(aPaymentReportOfficer).get(previousReportsUrl(bankId - 1));

    expect(status).toEqual(401);
  });

  it('returns the previous uploaded reports', async () => {
    const response = await as(aPaymentReportOfficer).get(previousReportsUrl(bankId));

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].year).toEqual(2023);
    expect(response.body[0].reports.length).toEqual(2);
    expect(response.body[0].reports[0].id).toEqual(receivedReportIds[0]);
    expect(response.body[0].reports[1].id).toEqual(receivedReportIds[1]);
  });
});
