const { HttpStatusCode } = require('axios');
const {
  UtilisationReportEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  CURRENCY,
} = require('@ukef/dtfs2-common');
const { SqlDbHelper } = require('../../../sql-db-helper.ts');
const app = require('../../../../src/createApp');
const { as, get } = require('../../../api')(app);
const testUserCache = require('../../../api-test-users');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../../src/v1/roles/roles');

console.error = jest.fn();

describe('GET /v1/banks/:bankId/fee-record-correction/:correctionId', () => {
  const getUrl = ({ bankId, correctionId }) => `/v1/banks/${bankId}/fee-record-correction/${correctionId}`;

  let testUsers;
  let barclaysBank;
  let hsbcBank;
  let aBarclaysPaymentReportOfficer;
  let aHsbcPaymentReportOfficer;

  const correctionId = 7;
  const facilityId = '12345678';
  const exporter = 'An exporter';
  const reportedFees = {
    currency: CURRENCY.GBP,
    amount: 77,
  };
  const reasons = [RECORD_CORRECTION_REASON.OTHER];
  const additionalInfo = 'Some additional info';

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    testUsers = await testUserCache.initialise(app);
    aBarclaysPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Test Bank 1').one();
    aHsbcPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Test Bank 2').one();
    barclaysBank = aBarclaysPaymentReportOfficer.bank;
    hsbcBank = aHsbcPaymentReportOfficer.bank;

    const utilisationReport = new UtilisationReportEntityMockBuilder().withBankId(barclaysBank.id).build();

    const aFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
      .withFacilityId(facilityId)
      .withExporter(exporter)
      .withFeesPaidToUkefForThePeriodCurrency(reportedFees.currency)
      .withFeesPaidToUkefForThePeriod(reportedFees.amount)
      .build();
    utilisationReport.feeRecords = [aFeeRecord];

    const aFeeRecordCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(aFeeRecord, false)
      .withId(correctionId)
      .withReasons(reasons)
      .withAdditionalInfo(additionalInfo)
      .build();

    await SqlDbHelper.saveNewEntries('UtilisationReport', [utilisationReport]);
    await SqlDbHelper.saveNewEntries('FeeRecordCorrection', [aFeeRecordCorrection]);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(getUrl({ bankId: barclaysBank.id, correctionId })),
    makeRequestWithAuthHeader: (authHeader) => get(getUrl({ bankId: barclaysBank.id, correctionId }), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).withBankName(barclaysBank.name).one(),
    makeRequestAsUser: (user) => as(user).get(getUrl({ bankId: barclaysBank.id, correctionId })),
    successStatusCode: HttpStatusCode.Ok,
  });

  it(`should return a '${HttpStatusCode.BadRequest}' status code if the bank id is invalid`, async () => {
    const { status } = await as(aBarclaysPaymentReportOfficer).get(getUrl({ bankId: 'invalid-bank-id', correctionId }));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return a '${HttpStatusCode.BadRequest}' status code if the correction id is invalid`, async () => {
    const { status } = await as(aBarclaysPaymentReportOfficer).get(getUrl({ bankId: barclaysBank.id, correctionId: 'invalid-correction-id' }));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return a '${HttpStatusCode.Unauthorized}' status code if users bank id does not match the bank id associated with the correction`, async () => {
    const { status } = await as(aBarclaysPaymentReportOfficer).get(getUrl({ bankId: hsbcBank.id, correctionId }));

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });

  it(`should return a '${HttpStatusCode.Ok}' status code and the fee record correction`, async () => {
    const response = await as(aBarclaysPaymentReportOfficer).get(getUrl({ bankId: barclaysBank.id, correctionId }));

    expect(response.status).toEqual(HttpStatusCode.Ok);

    expect(response.body).toEqual({
      id: correctionId,
      bankId: barclaysBank.id,
      facilityId,
      exporter,
      reportedFees,
      reasons,
      additionalInfo,
    });
  });
});
