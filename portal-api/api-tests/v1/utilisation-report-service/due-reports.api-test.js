const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { insertOneUtilisationReportDetails } = require('../../insertUtilisationReportDetails');

describe('GET /v1/banks/:bankId/due-reports', () => {
  const dueReportsUrl = (bankId) => `/v1/banks/${bankId}/due-reports`;
  let aPaymentReportOfficer;
  let mockUtilisationReport;
  let testUsers;
  let matchingBankId;

  const expectedDueReports = [{
    month: 12,
    year: 2022,
  }, {
    month: 1,
    year: 2023,
  }, {
    month: 2,
    year: 2023,
  }];

  beforeEach(() => {
    const mockDate = new Date('2023-03-01');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    const { bank } = aPaymentReportOfficer;
    const month = 11;
    const year = 2022;
    const dateUploaded = new Date(year, month - 1);
    mockUtilisationReport = {
      bank,
      month,
      year,
      dateUploaded,
      uploadedBy: aPaymentReportOfficer,
      path: 'www.abc.com',
    };
    await insertOneUtilisationReportDetails(mockUtilisationReport);
  });

  afterAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(dueReportsUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(dueReportsUrl(matchingBankId), { headers: { Authorization: authHeader } })
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
    makeRequestAsUser: (user) => as(user).get(dueReportsUrl(matchingBankId)),
    successStatusCode: 200,
  });

  it('400s requests that do not have a valid bank id', async () => {
    const { status } = await as(aPaymentReportOfficer).get(dueReportsUrl('620a1aa095a618b12da38c7b'));

    expect(status).toEqual(400);
  });

  it('401s requests if users bank != request bank', async () => {
    const { status } = await as(aPaymentReportOfficer).get(dueReportsUrl(matchingBankId - 1));

    expect(status).toEqual(401);
  });

  it('returns the requested resource', async () => {
    const { status, body } = await as(aPaymentReportOfficer).get(dueReportsUrl(matchingBankId));

    expect(status).toEqual(200);
    expect(body.data).toEqual(expectedDueReports);
  });
});
