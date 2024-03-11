const { SqlDbDataSource } = require('@ukef/dtfs2-common/sql-db-connection');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('@ukef/dtfs2-common');
const { anUploadedUtilisationReportEntity, aNotReceivedUtilisationReportEntity } = require('../../mocks/entities/utilisation-report-entity.ts');
const { wipeAllUtilisationReports, saveUtilisationReportToDatabase } = require('../../sql-db-helper.ts');
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
  let lastUploadedReportId;
  const lastUploadedReportPeriodMonth = 1;
  const lastUploadedReportDateUploaded = new Date('2023-01-01');
  const lastUploadedReport = {
    ...anUploadedUtilisationReportEntity(),
    reportPeriod: {
      start: {
        month: lastUploadedReportPeriodMonth,
        year,
      },
      end: {
        month: lastUploadedReportPeriodMonth,
        year,
      },
    },
    dateUploaded: lastUploadedReportDateUploaded,
  };

  beforeAll(async () => {
    await SqlDbDataSource.initialize();
    await wipeAllUtilisationReports();

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    const { bank } = aPaymentReportOfficer;
    lastUploadedReport.bankId = bank.id;
    const notReceivedReport = {
      ...aNotReceivedUtilisationReportEntity(),
      bankId: bank.id,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      reportPeriod: {
        start: {
          month: lastUploadedReportPeriodMonth + 1,
          year,
        },
        end: {
          month: lastUploadedReportPeriodMonth + 1,
          year,
        },
      },
    }

    lastUploadedReportId = (await saveUtilisationReportToDatabase(lastUploadedReport)).id;
    await saveUtilisationReportToDatabase(notReceivedReport);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(lastUploadedUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(lastUploadedUrl(matchingBankId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
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
