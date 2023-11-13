const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { insertManyUtilisationReportDetails } = require('../../insertUtilisationReportDetails');

describe('GET /v1/previous-reports/:bankId', () => {
  const previousReportsUrl = (bankId) => `/v1/previous-reports/${bankId}`;
  let aPaymentReportOfficer;
  let testUsers;
  let matchingBankId;
  let reportDetails;

  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    const { bank } = aPaymentReportOfficer;
    const year = 2023;
    const uploadedBy = aPaymentReportOfficer;
    const path = 'www.abc.com';
    reportDetails = [{
      bank,
      month: 1,
      year,
      dateUploaded: new Date(year, 0),
      uploadedBy,
      path,
    }, {
      bank,
      month: 2,
      year,
      dateUploaded: new Date(year, 1),
      uploadedBy,
      path,
    }, {
      bank,
      month: 3,
      year,
      dateUploaded: new Date(year, 2),
      uploadedBy,
      path,
    }];
    await insertManyUtilisationReportDetails(reportDetails);
  });

  afterAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(previousReportsUrl(matchingBankId)),
    makeRequestWithAuthHeader: (authHeader) => get(previousReportsUrl(matchingBankId), { headers: { Authorization: authHeader } })
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
    const response = await as(aPaymentReportOfficer).get(previousReportsUrl(matchingBankId));

    expect(response.status).toEqual(200);
    expect(response).toEqual(reportDetails);
  });
});
