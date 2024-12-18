import { HttpStatusCode } from 'axios';
import {
  FEE_RECORD_STATUS,
  FeeRecordCorrectionRequestTransientFormDataEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  RECORD_CORRECTION_REASON,
  RecordCorrectionRequestTransientFormData,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlAndMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/fee-records/:feeRecordId/correction-transient-form-data/:userId';

describe(`GET ${BASE_URL}`, () => {
  const reportId = 1;
  const feeRecordId = 2;
  const userId = '5c0a7922c9d89830f4911426';

  beforeAll(async () => {
    await SqlDbHelper.initialize();

    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  beforeEach(async () => {
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(feeRecordId).withStatus(FEE_RECORD_STATUS.TO_DO).build();
    report.feeRecords = [feeRecord];

    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionRequestTransientFormData');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  withSqlAndMongoIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
    sqlPathParameters: ['reportId', 'feeRecordId'],
    mongoPathParameters: ['userId'],
  });

  it(`should return '${HttpStatusCode.NotFound}' when no fee record with the supplied id can be found`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId: feeRecordId + 1, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.Ok}' with the form data if the request is valid and transient form data exists`, async () => {
    // Arrange
    const formData: RecordCorrectionRequestTransientFormData = {
      reasons: [RECORD_CORRECTION_REASON.OTHER],
      additionalInfo: 'Some additional information',
    };
    const transientFormDataEntity = new FeeRecordCorrectionRequestTransientFormDataEntityMockBuilder()
      .withFeeRecordId(feeRecordId)
      .withUserId(userId)
      .withFormData(formData)
      .build();
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionRequestTransientFormData', transientFormDataEntity);

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual(formData);
  });

  it(`should return '${HttpStatusCode.Ok}' with empty form data if the request is valid but transient form data does not exist`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual({});
  });
});
