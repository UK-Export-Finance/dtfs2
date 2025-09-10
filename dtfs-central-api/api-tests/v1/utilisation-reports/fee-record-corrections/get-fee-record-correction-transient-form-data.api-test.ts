import { anEmptyRecordCorrectionTransientFormData, FeeRecordCorrectionTransientFormDataEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { HttpStatusCode } from 'axios';
import { RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { withSqlAndMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { ObjectId } from 'mongodb';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/fee-record-corrections/:correctionId/transient-form-data/:userId';

describe(`GET ${BASE_URL}`, () => {
  const formDataCorrectionId = 123;
  const formDataCreatedByUserId = new ObjectId().toString();

  const otherCorrectionId = formDataCorrectionId + 1;
  const otherUserId = new ObjectId().toString();

  const transientFormData: RecordCorrectionTransientFormData = {
    ...anEmptyRecordCorrectionTransientFormData(),
    utilisation: 10000,
  };

  const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
    .withUserId(formDataCreatedByUserId)
    .withCorrectionId(formDataCorrectionId)
    .withFormData(transientFormData)
    .build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataEntity);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
  });

  withSqlAndMongoIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
    sqlPathParameters: ['correctionId'],
    mongoPathParameters: ['userId'],
  });

  it(`should return '${HttpStatusCode.Ok}' with an empty body when no transient form data exists for the user and correction combination`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { correctionId: otherCorrectionId, userId: otherUserId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual({});
  });

  it(`should return '${HttpStatusCode.Ok}' with an empty body when no transient form data exists for the user for the given correction id`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { correctionId: otherCorrectionId, userId: formDataCreatedByUserId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual({});
  });

  it(`should return '${HttpStatusCode.Ok}' with an empty body when no transient form data exists for the correction for the given user id`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { correctionId: formDataCorrectionId, userId: otherUserId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual({});
  });

  it(`should return '${HttpStatusCode.Ok}' with the form data if the request is valid and transient form data exists`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { correctionId: formDataCorrectionId, userId: formDataCreatedByUserId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual(transientFormData);
  });
});
