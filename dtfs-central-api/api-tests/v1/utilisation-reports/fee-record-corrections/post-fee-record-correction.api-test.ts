import { HttpStatusCode } from 'axios';
import {
  Bank,
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
import { aBank, aPortalUser, aTfmSessionUser } from '../../../../test-helpers';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/fee-records/:feeRecordId/corrections';

describe(`POST ${BASE_URL}`, () => {
  const reportId = 1;
  const feeRecordId = 11;
  const nonExistentFeeRecordId = 12;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const bankId = '123';
  const bankName = 'Test bank';
  const bankEmails = ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];
  const bank: Bank = {
    ...aBank(),
    id: bankId,
    name: bankName,
    paymentOfficerTeam: {
      teamName: 'Payment Reporting Team',
      emails: bankEmails,
    },
  };

  const uploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
    .withId(reportId)
    .withUploadedByUserId(portalUserId)
    .withBankId(bankId)
    .build();

  const feeRecord = FeeRecordEntityMockBuilder.forReport(uploadedUtilisationReport).withId(feeRecordId).withCorrections([]).build();
  uploadedUtilisationReport.feeRecords = [feeRecord];

  const transientFormDataForUserAndFeeRecord = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
    .withUserId(tfmUserId)
    .withFeeRecordId(feeRecordId)
    .build();

  const aValidRequestBody = () => ({
    user: {
      ...aTfmSessionUser(),
      email: 'payment-officer2@ukexportfinance.gov.uk',
      _id: tfmUserId,
    },
  });

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['users', 'tfm-users', 'banks']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
    await tfmUsersCollection.insertOne(tfmUser);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntries('UtilisationReport', [uploadedUtilisationReport]);
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

  it(`should respond with a ${HttpStatusCode.Ok} with the notified emails if the request is valid`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForUserAndFeeRecord);

    const requestBody = aValidRequestBody();

    const expectedEmails = [...bankEmails, requestBody.user.email];

    // Act
    const response = await testApi.post(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual({ emails: expectedEmails });
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} when payload is invalid`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForUserAndFeeRecord);

    const requestBody = {
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when the fee record requested does not exist`, async () => {
    // Arrange
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForUserAndFeeRecord);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId: nonExistentFeeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when the fee record requested does not belong to the report`, async () => {
    // Arrange
    const otherReportId = reportId + 1;
    const otherUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
      .withId(otherReportId)
      .withUploadedByUserId(portalUserId)
      .withBankId(bankId)
      .build();
    await SqlDbHelper.saveNewEntries('UtilisationReport', [otherUtilisationReport]);
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForUserAndFeeRecord);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId: otherReportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when there is no saved form data`, async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when there is no saved form data for the requesting user`, async () => {
    // Arrange
    const transientFormDataForOtherUser = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withUserId('abc123').withFeeRecordId(feeRecordId).build();
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForOtherUser);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when there is no saved form data for the fee record`, async () => {
    // Arrange
    const transientFormDataForOtherFeeRecord = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withUserId(tfmUserId).withFeeRecordId(888).build();
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForOtherFeeRecord);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} when the bank the report belongs to cannot be found`, async () => {
    // Arrange
    const reportWithNonExistentBank = new UtilisationReportEntityMockBuilder()
      .withBankId(`${bankId}222`)
      .withId(reportId + 1)
      .build();
    const reportFeeRecordId = feeRecordId + 10;
    const reportFeeRecord = FeeRecordEntityMockBuilder.forReport(reportWithNonExistentBank).withId(reportFeeRecordId).build();
    reportWithNonExistentBank.feeRecords = [reportFeeRecord];
    await SqlDbHelper.saveNewEntries('UtilisationReport', [reportWithNonExistentBank]);

    const transientFormDataForReportFeeRecord = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withUserId(tfmUserId)
      .withFeeRecordId(reportFeeRecordId)
      .build();
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataForReportFeeRecord);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi
      .post(requestBody)
      .to(replaceUrlParameterPlaceholders(BASE_URL, { reportId: reportWithNonExistentBank.id, feeRecordId: reportFeeRecordId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });
});
