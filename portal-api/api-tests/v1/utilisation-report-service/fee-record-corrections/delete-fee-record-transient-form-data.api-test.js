const { HttpStatusCode } = require('axios');
const app = require('../../../../server/createApp.js');
const { as, remove } = require('../../../api.js')(app);
const testUserCache = require('../../../api-test-users.js');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests.js');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests.js');
const { PAYMENT_REPORT_OFFICER } = require('../../../../server/v1/roles/roles.js');

describe('DELETE /v1/banks/:bankId/fee-record-correction/:correctionId/transient-form-data', () => {
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
    makeRequestWithoutAuthHeader: () => remove(correctionFormDataUrl(matchingBankId, correctionId)),
    makeRequestWithAuthHeader: (authHeader) => remove(correctionFormDataUrl(matchingBankId, correctionId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).remove().to(correctionFormDataUrl(matchingBankId, correctionId)),
    successStatusCode: HttpStatusCode.NoContent,
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} to requests that do not have a valid bank id`, async () => {
    const { status } = await as(aPaymentReportOfficer).remove().to(correctionFormDataUrl('invalid-bank-id', correctionId));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} if user's bank does not match request bank`, async () => {
    const { status } = await as(aPaymentReportOfficer)
      .remove()
      .to(correctionFormDataUrl(matchingBankId - 1, correctionId));

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });
});
