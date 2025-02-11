import { HttpStatusCode } from 'axios';
import { Response } from 'supertest';
import {
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntity,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordCorrectionTransientFormDataEntity,
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  RECORD_CORRECTION_REASON,
  ReportPeriod,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { ObjectId } from 'mongodb';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import wipeDB from '../../../wipeDB';
import { aBank } from '../../../../test-helpers';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';
import { mongoDbClient } from '../../../../src/drivers/db-client';
import { CustomErrorResponse } from '../../../helpers/custom-error-response';

console.error = jest.fn();

interface CustomSuccessResponse extends Response {
  body: {
    sentToEmails: string[];
    reportPeriod: ReportPeriod;
  };
}

const BASE_URL = '/v1/bank/:bankId/fee-record-corrections/:correctionId';

describe(`PUT ${BASE_URL}`, () => {
  const bankId = '1';
  const feeRecordId = 1;
  const correctionId = 2;
  const userId = new ObjectId().toString();

  const reportPeriod = { start: { month: 3, year: 2023 }, end: { month: 4, year: 2023 } };

  const paymentOfficerTeamEmails = ['payment-officer1@ukexportfinance.gov.uk'];

  const mockBank = {
    ...aBank(),
    id: bankId,
    paymentOfficerTeam: {
      emails: paymentOfficerTeamEmails,
      teamName: 'Payment Officer Team',
    },
  };

  const aValidRequestBody = () => ({
    user: { _id: userId },
  });

  const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

  const incorrectFacilityId = '11111111';
  const correctFacilityId = '22222222';

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await wipeDB.wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(mockBank);
  });

  beforeEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrection');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withBankId(bankId).withReportPeriod(reportPeriod).build();

    const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withId(feeRecordId)
      .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
      .withFacilityId(incorrectFacilityId)
      .build();

    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false).withId(correctionId).withReasons(reasons).build();

    feeRecord.corrections = [correction];
    report.feeRecords = [feeRecord];

    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const formData = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withCorrectionId(correctionId)
      .withUserId(userId)
      .withFormData({
        facilityId: correctFacilityId,
        additionalComments: null,
      })
      .build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', formData);
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrection');
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

  it(`should return '${HttpStatusCode.BadRequest}' when the user field is missing`, async () => {
    // Arrange
    const requestBody = {
      user: undefined,
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

  it(`should update the fee record with corrected values and set status to ${FEE_RECORD_STATUS.TO_DO_AMENDED}`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId }));

    // Assert
    const feeRecord = await SqlDbHelper.manager.findOneBy(FeeRecordEntity, { id: feeRecordId });
    expect(feeRecord?.facilityId).toEqual(correctFacilityId);
    expect(feeRecord?.status).toEqual(FEE_RECORD_STATUS.TO_DO_AMENDED);
  });

  it('should save the previous and corrected values on the correction and complete it', async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId }));

    // Assert
    const correction = await SqlDbHelper.manager.findOneBy(FeeRecordCorrectionEntity, { id: correctionId });

    const expectedPreviousValues = {
      facilityId: incorrectFacilityId,
      feesPaidToUkefForThePeriod: null,
      feesPaidToUkefForThePeriodCurrency: null,
      facilityUtilisation: null,
    };

    expect(correction?.previousValues).toEqual(expectedPreviousValues);

    const expectedCorrectedValues = {
      facilityId: correctFacilityId,
      feesPaidToUkefForThePeriod: null,
      feesPaidToUkefForThePeriodCurrency: null,
      facilityUtilisation: null,
    };

    expect(correction?.correctedValues).toEqual(expectedCorrectedValues);

    expect(correction?.isCompleted).toEqual(true);
  });

  it('should delete the transient form data', async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId }));

    // Assert
    const allTransientFormData = await SqlDbHelper.manager.find(FeeRecordCorrectionTransientFormDataEntity);
    expect(allTransientFormData).toHaveLength(0);
  });

  it('should return the sent to email addresses and the report period upon success', async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response: CustomSuccessResponse = await testApi.put(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { bankId, correctionId }));

    // Assert
    const expectedBody = {
      sentToEmails: paymentOfficerTeamEmails,
      reportPeriod,
    };
    expect(response.body).toEqual(expectedBody);
  });
});
