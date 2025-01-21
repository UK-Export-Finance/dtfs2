import { HttpStatusCode } from 'axios';
import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  RECORD_CORRECTION_REASON,
  RecordCorrectionFormValueValidationErrors,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { Response } from 'supertest';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { ObjectId } from 'mongodb';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import wipeDB from '../../../wipeDB';
import { aBank, aFacility, aTfmFacility } from '../../../../test-helpers';
import { PutFeeRecordCorrectionTransientFormDataPayload } from '../../../../src/v1/routes/middleware/payload-validation';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';
import { mongoDbClient } from '../../../../src/drivers/db-client';
import { CustomErrorResponse } from '../../../helpers/custom-error-response';

console.error = jest.fn();

interface PutFeeRecordCorrectionTransientFormDataResponse extends Response {
  body: { validationErrors?: RecordCorrectionFormValueValidationErrors } | string;
}

const BASE_URL = '/v1/bank/:bankId/fee-record-corrections/:correctionId/transient-form-data';

describe(`PUT ${BASE_URL}`, () => {
  const bankId = '1';
  const correctionId = 2;

  const facilityId = '11111111';
  const correctionReasons = Object.values(RECORD_CORRECTION_REASON);

  const mockBank = { ...aBank(), id: bankId, _id: new ObjectId() };

  const aValidRequestBody = () => ({
    formData: {
      utilisation: '1,000,000',
      facilityId,
      reportedCurrency: CURRENCY.GBP,
      reportedFee: '2,000',
      additionalComments: 'these are some additional comments',
    },
    user: { _id: new ObjectId().toString() },
  });

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await wipeDB.wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(mockBank);
  });

  beforeEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withBankId(bankId).build();

    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).withFacilityId(facilityId).build();

    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withId(correctionId)
      .withIsCompleted(false)
      .withReasons(correctionReasons)
      .build();

    feeRecord.corrections = [correction];
    report.feeRecords = [feeRecord];

    const tfmFacilitiesCollection = await mongoDbClient.getCollection('tfm-facilities');
    await tfmFacilitiesCollection.insertOne({
      ...aTfmFacility(),
      facilitySnapshot: {
        ...aFacility(),
        ukefFacilityId: facilityId,
      },
    });

    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL.replace(':bankId', bankId),
    makeRequest: (url) => testApi.put({}).to(url),
  });

  it(`should return ${HttpStatusCode.BadRequest} when an invalid bank id is provided`, async () => {
    // Act
    const response: CustomErrorResponse = await testApi
      .put(aValidRequestBody())
      .to(replaceUrlParameterPlaceholders(BASE_URL, { bankId: 'invalid-id', correctionId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
    expect(response.body.errors[0]?.msg).toEqual('The bank id provided should be a string of numbers');
  });

  const requiredPayloadKeys: (keyof PutFeeRecordCorrectionTransientFormDataPayload)[] = ['formData', 'user'];

  it.each([requiredPayloadKeys])(`should return '${HttpStatusCode.BadRequest}' when the '%s' field is missing`, async (payloadKey) => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      [payloadKey]: undefined,
    };

    // Act
    const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should return '${HttpStatusCode.NotFound}' when no correction exists with the requested bank id`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { bankId: `${bankId}123`, correctionId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.NotFound}' if no correction exists with the requested correction id`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const { status } = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId: correctionId + 1 }));

    // Assert
    expect(status).toEqual(HttpStatusCode.NotFound);
  });

  describe('when there are validation errors', () => {
    it(`should return '${HttpStatusCode.Ok}' with the errors in the response body`, async () => {
      // Arrange
      const formData = {
        utilisation: 'invalid-utilisation',
        facilityId: '123',
        reportedCurrency: 'invalid-currency',
        reportedFee: 'invalid-reported-fee',
        additionalComments: ' ',
      };

      const requestBody = {
        ...aValidRequestBody(),
        formData,
      };

      // Act
      const { status, body } = (await testApi
        .put(requestBody)
        .to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId }))) as PutFeeRecordCorrectionTransientFormDataResponse;

      // Assert
      const validationErrors: RecordCorrectionFormValueValidationErrors = {
        facilityIdErrorMessage: 'You must enter a facility ID between 8 and 10 digits using the numbers 0-9 only',
        reportedCurrencyErrorMessage: 'You must select a currency',
        reportedFeeErrorMessage: 'You must enter the reported fee in a valid format',
        utilisationErrorMessage: 'You must enter the utilisation in a valid format',
        additionalCommentsErrorMessage: 'You must enter a comment',
      };

      const expectedBody = {
        validationErrors,
      };

      expect(status).toEqual(HttpStatusCode.Ok);

      expect(body).toEqual(expectedBody);
    });
  });

  describe('when there are no validation errors', () => {
    it(`should return '${HttpStatusCode.Ok}' if the correction exists with an empty response body`, async () => {
      // Arrange
      const requestBody = aValidRequestBody();

      // Act
      const { status, body } = (await testApi
        .put(requestBody)
        .to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId }))) as PutFeeRecordCorrectionTransientFormDataResponse;

      // Assert
      const expectedBody = {};

      expect(status).toEqual(HttpStatusCode.Ok);

      expect(body).toEqual(expectedBody);
    });
  });
});
