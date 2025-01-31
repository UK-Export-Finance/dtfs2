const { HttpStatusCode } = require('axios');
const {
  UtilisationReportEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  FEE_RECORD_STATUS,
} = require('@ukef/dtfs2-common');
const { SqlDbHelper } = require('../../../sql-db-helper.ts');
const app = require('../../../../src/createApp.js');
const { as, get } = require('../../../api.js')(app);
const testUserCache = require('../../../api-test-users.js');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests.js');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests.js');
const { PAYMENT_REPORT_OFFICER } = require('../../../../src/v1/roles/roles.js');

console.error = jest.fn();

describe('GET /v1/banks/:bankId/utilisation-reports/completed-corrections', () => {
  const getUrl = ({ bankId }) => `/v1/banks/${bankId}/utilisation-reports/completed-corrections`;

  let testUsers;
  let aBarclaysPaymentReportOfficer;
  let barclaysBank;

  const exporter = 'An exporter';
  const correctionId = 7;
  const dateCorrectionReceived = new Date('2024-01-01');
  const oldFacilityId = '11111111';
  const newFacilityId = '22222222';
  const bankCommentary = 'Some bank commentary';

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    testUsers = await testUserCache.initialise(app);
    aBarclaysPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Barclays Bank').one();
    barclaysBank = aBarclaysPaymentReportOfficer.bank;

    const aUtilisationReport = new UtilisationReportEntityMockBuilder().withBankId(barclaysBank.id).build();

    const aFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
      .withExporter(exporter)
      .withFacilityId(oldFacilityId)
      .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
      .build();
    aUtilisationReport.feeRecords = [aFeeRecord];

    const aFeeRecordCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(aFeeRecord, true)
      .withId(correctionId)
      .withDateReceived(dateCorrectionReceived)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER])
      .withPreviousValues({
        facilityId: oldFacilityId,
      })
      .withCorrectedValues({
        facilityId: newFacilityId,
      })
      .withBankCommentary(bankCommentary)
      .build();

    await SqlDbHelper.saveNewEntries('UtilisationReport', [aUtilisationReport]);
    await SqlDbHelper.saveNewEntries('FeeRecordCorrection', [aFeeRecordCorrection]);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(getUrl({ bankId: barclaysBank.id })),
    makeRequestWithAuthHeader: (authHeader) => get(getUrl({ bankId: barclaysBank.id }), { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [PAYMENT_REPORT_OFFICER],
    getUserWithRole: (role) => testUsers().withRole(role).withBankName(barclaysBank.name).one(),
    makeRequestAsUser: (user) => as(user).get(getUrl({ bankId: barclaysBank.id })),
    successStatusCode: HttpStatusCode.Ok,
  });

  it(`should return a '${HttpStatusCode.Ok}' status code and the completed fee record corrections`, async () => {
    const response = await as(aBarclaysPaymentReportOfficer).get(getUrl({ bankId: barclaysBank.id }));

    expect(response.status).toEqual(HttpStatusCode.Ok);

    const expectedResponseBody = [
      {
        id: correctionId,
        dateSent: dateCorrectionReceived.toISOString(),
        exporter,
        formattedReasons: 'Facility ID is incorrect, Other',
        formattedPreviousValues: `${oldFacilityId}, -`,
        formattedCorrectedValues: `${newFacilityId}, -`,
        bankCommentary,
      },
    ];

    expect(response.body).toEqual(expectedResponseBody);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} to requests that do not have a valid bank id`, async () => {
    const { status } = await as(aBarclaysPaymentReportOfficer).get(getUrl({ bankId: 'invalid-bank-id' }));

    expect(status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.Unauthorized} if user's bank does not match request bank`, async () => {
    const { status } = await as(aBarclaysPaymentReportOfficer).get(getUrl({ bankId: barclaysBank.id - 1 }));

    expect(status).toEqual(HttpStatusCode.Unauthorized);
  });
});
