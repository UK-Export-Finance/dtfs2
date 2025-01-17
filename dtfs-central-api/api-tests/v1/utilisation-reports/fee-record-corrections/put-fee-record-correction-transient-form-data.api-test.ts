import { HttpStatusCode } from 'axios';
import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { ObjectId } from 'mongodb';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import wipeDB from '../../../wipeDB';
import { aBank } from '../../../../test-helpers';
import { PutFeeRecordCorrectionTransientFormDataPayload } from '../../../../src/v1/routes/middleware/payload-validation';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';
import { mongoDbClient } from '../../../../src/drivers/db-client';
import { CustomErrorResponse } from '../../../helpers/custom-error-response';

console.error = jest.fn();

const BASE_URL = '/v1/bank/:bankId/fee-record-corrections/:correctionId/transient-form-data';

describe(`PUT ${BASE_URL}`, () => {
  const bankId = '1';
  const correctionId = 2;

  const mockBank = { ...aBank(), id: bankId, _id: new ObjectId() };

  const aValidRequestBody = () => ({
    formData: {
      utilisation: '1,000,000',
      facilityId: '12345678',
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

    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();

    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false).withId(correctionId).build();

    feeRecord.corrections = [correction];
    report.feeRecords = [feeRecord];

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

  it(`should return '${HttpStatusCode.Ok}' if the correction exists`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const { status } = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId }));

    // Assert
    expect(status).toEqual(HttpStatusCode.Ok);
  });
});
