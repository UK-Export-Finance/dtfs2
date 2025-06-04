const { HttpStatusCode } = require('axios');
const {
  UtilisationReportEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  CURRENCY,
} = require('@ukef/dtfs2-common');
const { SqlDbHelper } = require('../../../sql-db-helper.ts');
const app = require('../../../../src/createApp.js');
const { as, get } = require('../../../api.js')(app);
const testUserCache = require('../../../api-test-users.js');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests.js');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests.js');
const { PAYMENT_REPORT_OFFICER } = require('../../../../src/v1/roles/roles.js');

console.error = jest.fn();

describe('GET /v1/banks/:bankId/fee-record-correction-review/:correctionId/user/:userId', () => {
  const getUrl = ({ bankId, correctionId, userId }) => `/v1/banks/${bankId}/fee-record-correction-review/${correctionId}/user/${userId}`;

  let testUsers;
  let Testbank1Bank;
  let Testbank2Bank;
  let aTestbank1PaymentReportOfficer;
  let aTestbank2PaymentReportOfficer;

  const correctionId = 7;
  const facilityId = '12345678';
  const exporter = 'An exporter';
  const reportedFees = {
    currency: CURRENCY.GBP,
    amount: 77,
  };
  const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.OTHER];
  const additionalInfo = 'Some additional PDC info';

  const transientFormData = {
    facilityId: '77777777',
    reportedCurrency: CURRENCY.USD,
    additionalComments: 'Some additional bank comments',
  };

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    testUsers = await testUserCache.initialise(app);
    aTestbank1PaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Bank 1').one();
    aTestbank2PaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Bank 2').one();
    Testbank1Bank = aTestbank1PaymentReportOfficer.bank;
    Testbank2Bank = aTestbank2PaymentReportOfficer.bank;

    const utilisationReport = new UtilisationReportEntityMockBuilder().withBankId(Testbank1Bank.id).build();

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

    const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withCorrectionId(correctionId)
      .withUserId(aTestbank1PaymentReportOfficer._id)
      .withFormData(transientFormData)
      .build();

    await SqlDbHelper.saveNewEntries('UtilisationReport', [utilisationReport]);
    await SqlDbHelper.saveNewEntries('FeeRecordCorrection', [aFeeRecordCorrection]);
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataEntity);
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrection');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(getUrl({ bankId: Testbank1Bank.id, correctionId, userId: aTestbank1PaymentReportOfficer._id })),
    makeRequestWithAuthHeader: (authHeader) =>
      get(getUrl({ bankId: Testbank1Bank.id, correctionId, userId: aTestbank1PaymentReportOfficer._id }), {
        headers: { Authorization: authHeader },
      }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).withBankName(Testbank1Bank.name).one(),
    makeRequestAsUser: (user) => as(user).get(getUrl({ bankId: Testbank1Bank.id, correctionId, userId: aTestbank1PaymentReportOfficer._id })),
    successStatusCode: HttpStatusCode.Ok,
  });

  it(`should return a '${HttpStatusCode.BadRequest}' status code if the bank id is invalid`, async () => {
    const { status } = await as(aTestbank1PaymentReportOfficer).get(
      getUrl({ bankId: 'invalid-bank-id', correctionId, userId: aTestbank1PaymentReportOfficer._id }),
    );

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return a '${HttpStatusCode.BadRequest}' status code if the correction id is invalid`, async () => {
    const { status } = await as(aTestbank1PaymentReportOfficer).get(
      getUrl({ bankId: Testbank1Bank.id, correctionId: 'invalid-correction-id', userId: aTestbank1PaymentReportOfficer._id }),
    );

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return a '${HttpStatusCode.BadRequest}' status code if the user id is invalid`, async () => {
    const { status } = await as(aTestbank1PaymentReportOfficer).get(getUrl({ bankId: Testbank1Bank.id, correctionId, userId: 'invalid-user-id' }));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return a '${HttpStatusCode.Unauthorized}' status code if users bank id does not match the bank id`, async () => {
    const { status } = await as(aTestbank1PaymentReportOfficer).get(
      getUrl({ bankId: Testbank2Bank.id, correctionId, userId: aTestbank1PaymentReportOfficer._id }),
    );

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });

  it(`should return a '${HttpStatusCode.Ok}' status code and the fee record correction review information`, async () => {
    const userId = aTestbank1PaymentReportOfficer._id;

    const response = await as(aTestbank1PaymentReportOfficer).get(getUrl({ bankId: Testbank1Bank.id, correctionId, userId }));

    const expectedResponseBody = {
      correctionId,
      feeRecord: {
        exporter,
        reportedFees,
      },
      reasons,
      errorSummary: additionalInfo,
      formattedOldValues: `${facilityId}, ${reportedFees.currency}, -`,
      formattedNewValues: `${transientFormData.facilityId}, ${transientFormData.reportedCurrency}, -`,
      bankCommentary: transientFormData.additionalComments,
    };

    expect(response.status).toEqual(HttpStatusCode.Ok);

    expect(response.body).toEqual(expectedResponseBody);
  });
});
