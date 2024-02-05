const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { insertManyUtilisationReportDetails } = require('../../insertUtilisationReportDetails');

describe('GET /v1/banks/:bankId/utilisation-reports/latest', () => {
  const latestReportUrl = (bankId) => `/v1/banks/${bankId}/utilisation-reports/latest`;
  let aPaymentReportOfficer;
  let mockUtilisationReports;
  let testUsers;
  let matchingBankId;
  let expectedReportResponse;

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    const { bank } = aPaymentReportOfficer;
    const year = 2023;
    mockUtilisationReports = [
      {
        bank,
        reportPeriod: {
          start: {
            month: 1,
            year,
          },
          end: {
            month: 1,
            year,
          },
        },
        dateUploaded: new Date('2023-01-01'),
        uploadedBy: aPaymentReportOfficer,
        path: 'www.abc.com',
      },
      {
        bank,
        reportPeriod: {
          start: {
            month: 2,
            year,
          },
          end: {
            month: 2,
            year,
          },
        },
        year,
        dateUploaded: new Date('2023-02-01'),
        uploadedBy: aPaymentReportOfficer,
        path: 'www.abc.com',
      },
    ];
    await insertManyUtilisationReportDetails(mockUtilisationReports);

    const latestMockReport = mockUtilisationReports.at(-1);
    expectedReportResponse = {
      reportPeriod: latestMockReport.reportPeriod,
      dateUploaded: latestMockReport.dateUploaded.toISOString(),
      path: latestMockReport.path,
    };
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
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
