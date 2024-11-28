import { HttpStatusCode } from 'axios';
import {
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import { mongoDbClient } from '../../../../src/drivers/db-client';
import { wipe } from '../../../wipeDB';
import { aPortalUser, aTfmSessionUser } from '../../../../test-helpers';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/feeRecords/:feeRecordId/corrections';

describe(`POST ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string, feeRecordId: number | string) =>
    BASE_URL.replace(':reportId', reportId.toString()).replace(':feeRecordId', feeRecordId.toString());

  const reportId = 1;
  const otherReportId = 2;
  const feeRecordId = 11;
  const nonExistantFeeRecordId = 12;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const uploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
    .withId(reportId)
    .withUploadedByUserId(portalUserId)
    .build();

  const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(feeRecordId).withCorrections([]).build();
  uploadedUtilisationReport.feeRecords = [feeRecord];

  const otherUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
    .withId(otherReportId)
    .withUploadedByUserId(portalUserId)
    .build();

  const transientFormDataForUserAndFeeRecord = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
    .withUserId(tfmUserId)
    .withFeeRecordId(feeRecordId)
    .build();
  const transientFormDataForOtherUser = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withUserId('abc123').withFeeRecordId(feeRecordId).build();
  const transientFormDataForOtherFeeRecord = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withUserId(tfmUserId).withFeeRecordId(888).build();

  const aValidRequestBody = () => ({
    user: {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    },
  });

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['users', 'tfm-users']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
    await tfmUsersCollection.insertOne(tfmUser);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntries('UtilisationReport', [uploadedUtilisationReport, otherUtilisationReport]);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
    await wipe(['users', 'tfm-users']);
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.post(aValidRequestBody()).to(url),
  });

  it(`should respond with a ${HttpStatusCode.Ok} with a valid request body`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForUserAndFeeRecord);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when payload is invalid`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForUserAndFeeRecord);

    const requestBody = {
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when the fee record requested does not exist`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForUserAndFeeRecord);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId, nonExistantFeeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when the fee record requested does not belong to the report`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForUserAndFeeRecord);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(otherReportId, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when there is no saved form data`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(otherReportId, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when there is no saved form data for the requesting user`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForOtherUser);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(otherReportId, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when there is no saved form data for the fee record`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForOtherFeeRecord);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(otherReportId, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });
});
