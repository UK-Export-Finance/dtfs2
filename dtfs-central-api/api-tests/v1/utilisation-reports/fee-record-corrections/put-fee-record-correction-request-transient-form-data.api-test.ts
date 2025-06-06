import { HttpStatusCode } from 'axios';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT,
  RECONCILIATION_IN_PROGRESS,
  RECORD_CORRECTION_REASON,
  RecordCorrectionRequestTransientFormData,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PutFeeRecordCorrectionRequestTransientFormDataPayload } from '../../../../src/v1/routes/middleware/payload-validation';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/fee-records/:feeRecordId/correction-request-transient-form-data';

describe(`PUT ${BASE_URL}`, () => {
  const reportId = 1;
  const feeRecordId = 2;

  const aValidRequestBody = () => ({
    formData: {
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
      additionalInfo: 'Some additional info',
    },
    user: aTfmSessionUser(),
  });

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

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.put({}).to(url),
  });

  const requiredPayloadKeys: (keyof PutFeeRecordCorrectionRequestTransientFormDataPayload)[] = ['formData', 'user'];
  const requiredFormDataPayloadKeys: (keyof RecordCorrectionRequestTransientFormData)[] = ['reasons', 'additionalInfo'];

  it.each([requiredPayloadKeys])(`should return '${HttpStatusCode.BadRequest}' when the '%s' field is missing`, async (payloadKey) => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      [payloadKey]: undefined,
    };

    // Act
    const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it.each(requiredFormDataPayloadKeys)(
    `should return a '${HttpStatusCode.BadRequest}' when the formData field is missing its '%s' field`,
    async (payloadKey) => {
      // Arrange
      const validRequestBody = aValidRequestBody();
      const requestBody = {
        ...validRequestBody,
        formData: {
          ...validRequestBody.formData,
          [payloadKey]: undefined,
        },
      };

      // Act
      const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

      // Assert
      expect(response.status).toEqual(HttpStatusCode.BadRequest);
    },
  );

  it(`should return '${HttpStatusCode.BadRequest}' when one of the formData 'reasons' items is not a RECORD_CORRECTION_REASON`, async () => {
    // Arrange
    const validRequestBody = aValidRequestBody();
    const requestBody = {
      ...validRequestBody,
      formData: {
        ...validRequestBody.formData,
        reasons: ['invalid-reason'],
      },
    };

    // Act
    const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return '${HttpStatusCode.BadRequest}' when the formData 'reasons' array is empty`, async () => {
    // Arrange
    const validRequestBody = aValidRequestBody();
    const requestBody = {
      ...validRequestBody,
      formData: {
        ...validRequestBody.formData,
        reasons: [],
      },
    };

    // Act
    const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return '${HttpStatusCode.BadRequest}' when the formData 'additionalInfo' field is an empty string`, async () => {
    // Arrange
    const validRequestBody = aValidRequestBody();
    const requestBody = {
      ...validRequestBody,
      formData: {
        ...validRequestBody.formData,
        additionalInfo: '',
      },
    };

    // Act
    const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return '${HttpStatusCode.BadRequest}' when the formData 'additionalInfo' field is a string with more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters`, async () => {
    // Arrange
    const validRequestBody = aValidRequestBody();
    const requestBody = {
      ...validRequestBody,
      formData: {
        ...validRequestBody.formData,
        additionalInfo: 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1),
      },
    };

    // Act
    const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return '${HttpStatusCode.NotFound}' when no fee record with the supplied id can be found`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId: feeRecordId + 1 }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.Ok}' if the request body is valid`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const { status } = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(status).toEqual(HttpStatusCode.Ok);
  });
});
