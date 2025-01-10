const { HttpStatusCode } = require('axios');
const app = require('../../../../src/createApp.js');
const { as, get } = require('../../../api.js')(app);
const testUserCache = require('../../../api-test-users.js');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests.js');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests.js');
const { PAYMENT_REPORT_OFFICER } = require('../../../../src/v1/roles/roles.js');

describe('GET /v1/banks/:bankId/fee-record-correction/:correctionId', () => {
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
    makeRequestWithoutAuthHeader: () => get(correctionFormDataUrl(matchingBankId, correctionId)),
    makeRequestWithAuthHeader: (authHeader) => get(correctionFormDataUrl(matchingBankId, correctionId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(correctionFormDataUrl(matchingBankId, correctionId)),
    successStatusCode: HttpStatusCode.Ok,
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} to requests that do not have a valid bank id`, async () => {
    const { status } = await as(aPaymentReportOfficer).get(correctionFormDataUrl('invalid-bank-id', correctionId));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} if user's bank does not match request bank`, async () => {
    const { status } = await as(aPaymentReportOfficer).get(correctionFormDataUrl(matchingBankId - 1, correctionId));

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });
});
