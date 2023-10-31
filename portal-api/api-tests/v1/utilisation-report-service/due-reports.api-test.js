const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
// const mockUtilisationReports = require('../../fixtures/utilisation-report-service/reports');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');

const collectionName = 'utilisation-reports';
// TODO FN-969 backend - update upload report endpoint
// const createReportUrl = '/v1/utilisation-report-service/create';

describe('GET /v1/due-reports/:bankId', () => {
  const dueReportsUrl = '/v1/due-reports/9';
  // let aPaymentReportOfficer;
  // let mockUtilisationReport;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);

    // aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);

    // create a utilisation report
    // mockUtilisationReport = await as(aPaymentReportOfficer)
    //   .post({ ...mockUtilisationReports[0], bankId: aPaymentReportOfficer.bank.id })
    //   .to(createReportUrl);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(dueReportsUrl),
    makeRequestWithAuthHeader: (authHeader) => get(dueReportsUrl, { headers: { Authorization: authHeader } })
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
    makeRequestAsUser: (user) => as(user).get(dueReportsUrl),
    successStatusCode: 200,
  });

  // it('400s requests that do not have a valid bank id', async () => {
  // const { status } = await as(aPaymentReportOfficer).get(dueReportsUrl(1));

  //   expect(status).toEqual(400);
  // });

  // it('404s requests for unknown ids', async () => {
  //   const { status } = await as(aPaymentReportOfficer).get(dueReportsUrl('620a1aa095a618b12da38c7b'));

  //   expect(status).toEqual(404);
  // });

  // it('401s requests if users bank != request bank', async () => {
  //   const { status } = await as(aPaymentReportOfficer).get(dueReportsUrl());

  //   expect(status).toEqual(401);
  // });

  // it('returns the requested resource', async () => {
  //   const { status, body } = await as(aPaymentReportOfficer).get(dueReportsUrl());

  //   expect(status).toEqual(200);
  //   // TODO FN-969 backend - update this to equal expected body
  //   expect(body.data).toEqual(expectAddedFields(newDeal));
  // });
});
