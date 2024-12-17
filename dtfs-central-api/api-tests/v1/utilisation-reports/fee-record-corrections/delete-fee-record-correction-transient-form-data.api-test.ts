import { HttpStatusCode } from 'axios';
import {
  FEE_RECORD_STATUS,
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
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/fee-records/:feeRecordId/correction-transient-form-data/:userId';

describe(`DELETE ${BASE_URL}`, () => {
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
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  withSqlAndMongoIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.remove({}).to(url),
    sqlPathParameters: ['reportId', 'feeRecordId'],
    mongoPathParameters: ['userId'],
  });

  it(`should return '${HttpStatusCode.NoContent}' if the request is valid and transient form data exists`, async () => {
    // Arrange
    const formData: RecordCorrectionTransientFormData = {
      reasons: [RECORD_CORRECTION_REASON.OTHER],
      additionalInfo: 'Some additional information',
    };
    const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withFeeRecordId(feeRecordId)
      .withUserId(userId)
      .withFormData(formData)
      .build();
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataEntity);

    // Act
    const response = await testApi.remove({}).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NoContent);
  });

  it(`should return '${HttpStatusCode.NoContent}' if the request is valid but transient form data does not exist`, async () => {
    // Act
    const response = await testApi.remove({}).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NoContent);
  });

  it(`should return '${HttpStatusCode.NotFound}' when no fee record with the supplied id can be found`, async () => {
    // Act
    const response = await testApi.remove({}).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId: feeRecordId + 1, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });
});
