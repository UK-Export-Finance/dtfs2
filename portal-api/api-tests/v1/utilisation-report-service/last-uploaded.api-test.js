const { UTILISATION_REPORT_STATUS, UtilisationReportEntityMockBuilder } = require('@ukef/dtfs2-common');
const { SqlDbHelper } = require('../../sql-db-helper.ts');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');

console.error = jest.fn();

describe('GET /v1/banks/:bankId/utilisation-reports/last-uploaded', () => {
  const lastUploadedUrl = (bankId) => `/v1/banks/${bankId}/utilisation-reports/last-uploaded`;
  let aPaymentReportOfficer;
  let testUsers;
  let matchingBankId;

  const year = 2023;
  const lastUploadedReportId = 5;
  const lastUploadedReportPeriodMonth = 1;
  const lastUploadedReportDateUploaded = new Date('2023-01-01');
  const lastUploadedReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION)
    .withId(lastUploadedReportId)
    .withReportPeriod({
      start: {
        month: lastUploadedReportPeriodMonth,
        year,
      },
      end: {
        month: lastUploadedReportPeriodMonth,
        year,
      },
    })
    .withDateUploaded(lastUploadedReportDateUploaded)
    .build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    lastUploadedReport.bankId = aPaymentReportOfficer.bank.id;
    lastUploadedReport.uploadedByUserId = aPaymentReportOfficer._id.toString();

    const notReceivedReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED)
      .withId(6)
      .withBankId(aPaymentReportOfficer.bank.id)
      .withReportPeriod({
        start: {
          month: lastUploadedReportPeriodMonth + 1,
          year,
        },
        end: {
          month: lastUploadedReportPeriodMonth + 1,
          year,
        },
      })
      .build();

    await SqlDbHelper.saveNewEntry('UtilisationReport', lastUploadedReport);
    await SqlDbHelper.saveNewEntry('UtilisationReport', notReceivedReport);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(lastUploadedUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(lastUploadedUrl(matchingBankId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(lastUploadedUrl(matchingBankId)),
    successStatusCode: 200,
  });

  it('400s requests that do not have a valid bank id', async () => {
    const { status } = await as(aPaymentReportOfficer).get(lastUploadedUrl('620a1aa095a618b12da38c7b'));

    expect(status).toEqual(400);
  });

  it('401s requests if users bank is not the requested bank', async () => {
    const { status } = await as(aPaymentReportOfficer).get(lastUploadedUrl(matchingBankId - 1));

    expect(status).toEqual(401);
  });

  it('returns the requested resource', async () => {
    const response = await as(aPaymentReportOfficer).get(lastUploadedUrl(matchingBankId));

    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(lastUploadedReportId);
  });
});
