const { HttpStatusCode } = require('axios');
const {
  aRecordCorrectionFormValues,
  UtilisationReportEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
} = require('@ukef/dtfs2-common');
const { SqlDbHelper } = require('../../../sql-db-helper.ts');
const app = require('../../../../src/createApp.js');
const { as, put } = require('../../../api.js')(app);
const testUserCache = require('../../../api-test-users.js');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests.js');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests.js');
const { PAYMENT_REPORT_OFFICER } = require('../../../../src/v1/roles/roles.js');

console.error = jest.fn();

describe('PUT /v1/banks/:bankId/fee-record-correction/:correctionId/transient-form-data', () => {
  const correctionFormDataUrl = (bankId, correctionId) => `/v1/banks/${bankId}/fee-record-correction/${correctionId}/transient-form-data`;
  let aPaymentReportOfficer;
  let testUsers;
  let matchingBankId;
  const correctionId = 123;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;

    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    const utilisationReport = new UtilisationReportEntityMockBuilder().withBankId(matchingBankId).build();

    const aFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).build();
    utilisationReport.feeRecords = [aFeeRecord];

    const aFeeRecordCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(aFeeRecord, false).withId(correctionId).build();

    await SqlDbHelper.saveNewEntries('UtilisationReport', [utilisationReport]);
    await SqlDbHelper.saveNewEntries('FeeRecordCorrection', [aFeeRecordCorrection]);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => put(correctionFormDataUrl(matchingBankId, correctionId), aRecordCorrectionFormValues()),
    makeRequestWithAuthHeader: (authHeader) =>
      put(correctionFormDataUrl(matchingBankId, correctionId), aRecordCorrectionFormValues(), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).put(aRecordCorrectionFormValues()).to(correctionFormDataUrl(matchingBankId, correctionId)),
    successStatusCode: HttpStatusCode.Ok,
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} to requests that do not have a valid bank id`, async () => {
    const { status } = await as(aPaymentReportOfficer).put(aRecordCorrectionFormValues()).to(correctionFormDataUrl('invalid-bank-id', correctionId));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} if user's bank does not match request bank`, async () => {
    const { status } = await as(aPaymentReportOfficer)
      .put(aRecordCorrectionFormValues())
      .to(correctionFormDataUrl(matchingBankId - 1, correctionId));

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });
});
