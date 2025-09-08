import { HttpStatusCode } from 'axios';
import {
  anEmptyRecordCorrectionTransientFormData,
  Bank,
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordCorrectionReviewInformation,
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  RECORD_CORRECTION_REASON,
  RecordCorrectionTransientFormData,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlAndMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import { aBank } from '../../../../test-helpers';
import { mongoDbClient } from '../../../../server/drivers/db-client';
import { wipe } from '../../../wipeDB';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/fee-record-correction-review/:correctionId/user/:userId';

describe(`GET ${BASE_URL}`, () => {
  const reportId = 1;
  const feeRecordId = 2;
  const correctionId = 3;
  const userId = '5c0a7922c9d89830f4911426';

  const bankId = '123';
  const bank: Bank = {
    ...aBank(),
    id: bankId,
  };

  const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
  const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(feeRecordId).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();
  report.feeRecords = [feeRecord];

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);

    await SqlDbHelper.saveNewEntries('UtilisationReport', [report]);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrection');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);
  });

  withSqlAndMongoIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
    sqlPathParameters: ['correctionId'],
    mongoPathParameters: ['userId'],
  });

  it(`should return '${HttpStatusCode.NotFound}' when no fee record correction with the supplied id can be found`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { userId, correctionId: correctionId + 1 }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.NotFound}' when no correction transient form data exists`, async () => {
    // Arrange
    const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false).withId(correctionId).build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrection', feeRecordCorrectionEntity);

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { userId, correctionId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.NotFound}' when correction transient form data exists for the correction id but not for the given user`, async () => {
    // Arrange
    const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false).withId(correctionId).build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrection', feeRecordCorrectionEntity);

    const anotherUserId = `${userId}abc`;

    const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withCorrectionId(correctionId)
      .withUserId(anotherUserId)
      .build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataEntity);

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { userId, correctionId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.Ok}' and the fee record correction review information`, async () => {
    // Arrange
    const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];
    const errorSummary = 'Some additional PDC comments';
    const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
      .withId(correctionId)
      .withReasons(reasons)
      .withAdditionalInfo(errorSummary)
      .build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrection', feeRecordCorrectionEntity);

    const formData: RecordCorrectionTransientFormData = {
      ...anEmptyRecordCorrectionTransientFormData(),
      facilityId: '77777777',
      reportedCurrency: CURRENCY.USD,
      additionalComments: 'Some additional bank comments',
    };

    const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withCorrectionId(correctionId)
      .withUserId(userId)
      .withFormData(formData)
      .build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataEntity);

    const expectedResponse: FeeRecordCorrectionReviewInformation = {
      correctionId,
      feeRecord: {
        exporter: feeRecord.exporter,
        reportedFees: {
          currency: feeRecord.feesPaidToUkefForThePeriodCurrency,
          amount: feeRecord.feesPaidToUkefForThePeriod,
        },
      },
      reasons,
      errorSummary,
      formattedOldValues: `${feeRecord.facilityId}, ${feeRecord.feesPaidToUkefForThePeriodCurrency}`,
      formattedNewValues: `${formData.facilityId}, ${formData.reportedCurrency}`,
      bankCommentary: formData.additionalComments,
    };

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { correctionId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual(expectedResponse);
  });
});
