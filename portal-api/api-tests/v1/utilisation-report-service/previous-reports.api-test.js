const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { insertManyUtilisationReportDetails } = require('../../insertUtilisationReportDetails');

describe('GET /v1/previous-reports/:bankId', () => {
  const previousReportsUrl = (bankId) => `/v1/banks/${bankId}/utilisation-reports`;
  let aPaymentReportOfficer;
  let testUsers;
  let matchingBankId;
  let reportDetails;

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    const bank = {
      id: aPaymentReportOfficer.bank.id,
      name: aPaymentReportOfficer.bank.name,
    };
    const year = 2023;
    const azureFileInfo = {
      folder: 'test_bank',
      filename: '2021_January_test_bank_utilisation_report.csv',
      fullPath: 'test_bank/2021_January_test_bank_utilisation_report.csv',
      url: 'test.url.csv',
      mimetype: 'text/csv',
    };
    const uploadedBy = {
      id: aPaymentReportOfficer._id,
      firstname: aPaymentReportOfficer.firstname,
      surname: aPaymentReportOfficer.surname,
    };
    reportDetails = [
      {
        bank,
        month: 1,
        year,
        dateUploaded: new Date(year, 0),
        azureFileInfo,
        uploadedBy,
      },
      {
        bank,
        month: 2,
        year,
        dateUploaded: new Date(year, 1),
        azureFileInfo,
        uploadedBy,
      },
      {
        bank,
        month: 3,
        year,
        dateUploaded: new Date(year, 2),
        azureFileInfo,
        uploadedBy,
      },
    ];
    await insertManyUtilisationReportDetails(reportDetails);
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(previousReportsUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(previousReportsUrl(matchingBankId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
    makeRequestAsUser: (user) => as(user).get(previousReportsUrl(matchingBankId)),
    successStatusCode: 200,
  });

  it('400s requests that do not have a valid bank id', async () => {
    const { status } = await as(aPaymentReportOfficer).get(previousReportsUrl('620a1aa095a618b12da38c7b'));

    expect(status).toEqual(400);
  });

  it('401s requests if users bank != request bank', async () => {
    const { status } = await as(aPaymentReportOfficer).get(previousReportsUrl(matchingBankId - 1));

    expect(status).toEqual(401);
  });

  it('returns the requested resource', async () => {
    const expectedResponse = [
      {
        year: 2023,
        reports: reportDetails,
      },
    ];

    const { status, text } = await as(aPaymentReportOfficer).get(previousReportsUrl(matchingBankId));

    expect(status).toEqual(200);
    expect(JSON.parse(text)).toEqual(JSON.parse(JSON.stringify(expectedResponse)));
  });
});
