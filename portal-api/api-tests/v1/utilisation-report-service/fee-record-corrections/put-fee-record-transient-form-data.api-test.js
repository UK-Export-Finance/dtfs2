const { HttpStatusCode } = require('axios');
const { aRecordCorrectionFormValues } = require('@ukef/dtfs2-common');
const app = require('../../../../src/createApp.js');
const { as, put } = require('../../../api.js')(app);
const testUserCache = require('../../../api-test-users.js');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests.js');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests.js');
const { PAYMENT_REPORT_OFFICER } = require('../../../../src/v1/roles/roles.js');

describe('PUT /v1/banks/:bankId/utilisation-reports/pending-corrections', () => {
  const correctionFormDataUrl = (bankId, correctionId) => `/v1/banks/${bankId}/fee-record-correction/${correctionId}/transient-form-data`;
  let aPaymentReportOfficer;
  let testUsers;
  let matchingBankId;
  const correctionId = 123;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => put(correctionFormDataUrl(matchingBankId, correctionId), aRecordCorrectionFormValues()),
    makeRequestWithAuthHeader: (authHeader) =>
      put(correctionFormDataUrl(matchingBankId, correctionId), aRecordCorrectionFormValues(), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).put(correctionFormDataUrl(matchingBankId, correctionId)),
    successStatusCode: HttpStatusCode.Ok,
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} to requests that do not have a valid bank id`, async () => {
    const { status } = await as(aPaymentReportOfficer).put(correctionFormDataUrl('invalid-bank-id', correctionId));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} if user's bank does not match request bank`, async () => {
    const { status } = await as(aPaymentReportOfficer).put(correctionFormDataUrl(matchingBankId - 1, correctionId));

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });
});
