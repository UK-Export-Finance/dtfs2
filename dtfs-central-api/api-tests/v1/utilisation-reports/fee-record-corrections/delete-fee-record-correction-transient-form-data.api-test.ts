import { HttpStatusCode } from 'axios';
import {
  anEmptyRecordCorrectionTransientFormData,
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  RecordCorrectionTransientFormData,
} from '@ukef/dtfs2-common';
import { withSqlAndMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/fee-record-corrections/:correctionId/transient-form-data/:userId';

describe(`DELETE ${BASE_URL}`, () => {
  const correctionId = 1;
  const userId = '5c0a7922c9d89830f4911426';

  beforeAll(async () => {
    await SqlDbHelper.initialize();
  });

  beforeEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionRequestTransientFormData');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionRequestTransientFormData');
  });

  withSqlAndMongoIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.remove({}).to(url),
    sqlPathParameters: ['correctionId'],
    mongoPathParameters: ['userId'],
  });

  it(`should return '${HttpStatusCode.NoContent}' if the request is valid and transient form data exists`, async () => {
    // Arrange
    const formData: RecordCorrectionTransientFormData = {
      ...anEmptyRecordCorrectionTransientFormData(),
      utilisation: 1000,
    };

    const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withCorrectionId(correctionId)
      .withUserId(userId)
      .withFormData(formData)
      .build();
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataEntity);

    // Act
    const response = await testApi.remove({}).to(replaceUrlParameterPlaceholders(BASE_URL, { correctionId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NoContent);
  });

  it(`should return '${HttpStatusCode.NoContent}' if the request is valid but transient form data does not exist`, async () => {
    // Act
    const response = await testApi.remove({}).to(replaceUrlParameterPlaceholders(BASE_URL, { correctionId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NoContent);
  });
});
