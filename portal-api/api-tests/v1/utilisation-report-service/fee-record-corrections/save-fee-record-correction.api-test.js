const { HttpStatusCode } = require('axios');
const { PENDING_RECONCILIATION, FEE_RECORD_STATUS, RECORD_CORRECTION_REASON } = require('@ukef/dtfs2-common');
const {
  UtilisationReportEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
} = require('@ukef/dtfs2-common/test-helpers');
const { SqlDbHelper } = require('../../../sql-db-helper.ts');
const app = require('../../../../server/createApp.js');
const { as, put } = require('../../../api.js')(app);
const testUserCache = require('../../../api-test-users.js');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests.js');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests.js');
const { PAYMENT_REPORT_OFFICER } = require('../../../../server/v1/roles/roles.js');

describe('PUT /v1/banks/:bankId/fee-record-correction/:correctionId', () => {
  const correctionUrl = (bankId, correctionId) => `/v1/banks/${bankId}/fee-record-correction/${correctionId}`;
  let aPaymentReportOfficer;
  let testUsers;
  let matchingBankId;
  const correctionId = 123;

  beforeAll(async () => {
    await SqlDbHelper.initialize();

    testUsers = await testUserCache.initialise(app);
    aPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).one();
    matchingBankId = aPaymentReportOfficer.bank.id;
  });

  beforeEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');

    const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withBankId(matchingBankId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();
    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
      .withId(correctionId)
      .withReasons([RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .build();

    feeRecord.corrections = [correction];
    report.feeRecords = [feeRecord];

    const transientFormData = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withCorrectionId(correctionId)
      .withUserId(aPaymentReportOfficer._id)
      .withFormData({ reportedFee: 1234.56 })
      .build();

    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormData);
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => put(correctionUrl(matchingBankId, correctionId)),
    makeRequestWithAuthHeader: (authHeader) => put(correctionUrl(matchingBankId, correctionId), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).put().to(correctionUrl(matchingBankId, correctionId)),
    successStatusCode: HttpStatusCode.Ok,
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} to requests that do not have a valid bank id`, async () => {
    const { status } = await as(aPaymentReportOfficer).put().to(correctionUrl('invalid-bank-id', correctionId));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} if user's bank does not match request bank`, async () => {
    const { status } = await as(aPaymentReportOfficer)
      .put()
      .to(correctionUrl(matchingBankId - 1, correctionId));

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });
});
