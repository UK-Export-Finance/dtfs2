const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { insertManyUtilisationReportDetails } = require('../../insertUtilisationReportDetails');
const { MOCK_NOT_RECEIVED_REPORT_DETAILS, MOCK_RECEIVED_REPORT_DETAILS_WITHOUT_ID } = require('../../fixtures/mock-utilisation-report-details');

console.error = jest.fn();

describe('GET /v1/banks/:bankId/utilisation-reports/last-uploaded', () => {
  const lastUploadedUrl = (bankId) => `/v1/banks/${bankId}/utilisation-reports/last-uploaded`;
  let aPaymentReportOfficer;
  let mockUtilisationReports;
  let testUsers;
  let matchingBankId;

  const year = 2023;
  let lastUploadedReportId;
  const lastUploadedReportPeriodMonth = 1;
  const lastUploadedReportDateUploaded = new Date('2023-01-01');
  const lastUploadedReport = {
    ...MOCK_RECEIVED_REPORT_DETAILS_WITHOUT_ID,
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
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    const { bank } = aPaymentReportOfficer;
    lastUploadedReport.bank = bank;

    mockUtilisationReports = [
      lastUploadedReport,
      {
        ...MOCK_NOT_RECEIVED_REPORT_DETAILS,
        bank,
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
        azureFileInfo: null,
      },
    ];

    const insertManyResult = await insertManyUtilisationReportDetails(mockUtilisationReports);
    const { insertedIds } = insertManyResult;
    const lastUploadedReportIndex = mockUtilisationReports.indexOf(lastUploadedReport);
    lastUploadedReportId = insertedIds[lastUploadedReportIndex].toString();
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
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

  it('401s requests if users bank != request bank', async () => {
    const { status } = await as(aPaymentReportOfficer).get(lastUploadedUrl(matchingBankId - 1));

    expect(status).toEqual(401);
  });

  it('returns the requested resource', async () => {
    const response = await as(aPaymentReportOfficer).get(lastUploadedUrl(matchingBankId));

    expect(response.status).toEqual(200);
    expect(JSON.parse(response.text)).toEqual({
      ...lastUploadedReport,
      _id: lastUploadedReportId,
      dateUploaded: lastUploadedReportDateUploaded.toISOString(),
    });
  });
});
