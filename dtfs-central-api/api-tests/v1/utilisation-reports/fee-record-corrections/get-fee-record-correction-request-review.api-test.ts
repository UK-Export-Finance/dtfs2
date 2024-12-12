import { HttpStatusCode } from 'axios';
import {
  Bank,
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
import { aBank } from '../../../../test-helpers';
import { mongoDbClient } from '../../../../src/drivers/db-client';
import { wipe } from '../../../wipeDB';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/fee-records/:feeRecordId/correction-request-review/:userId';

describe(`GET ${BASE_URL}`, () => {
  const reportId = 1;
  const feeRecordId = 2;
  const userId = '5c0a7922c9d89830f4911426';

  const bankId = '123';
  const nonExistingBankId = '321';
  const bank: Bank = {
    ...aBank(),
    id: bankId,
    name: 'Test bank',
    paymentOfficerTeam: {
      emails: ['one@email.com', 'two@email.com'],
      teamName: 'Test team',
    },
  };

  const reportIdWithNoMatchingBank = 78;
  const feeRecordIdWithNoMatchingBank = 79;

  const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
  const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(feeRecordId).withStatus(FEE_RECORD_STATUS.TO_DO).build();
  report.feeRecords = [feeRecord];

  const reportWithNoMatchingBank = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
    .withId(reportIdWithNoMatchingBank)
    .withBankId(nonExistingBankId)
    .build();
  const feeRecordWithNoMatchingBank = FeeRecordEntityMockBuilder.forReport(reportWithNoMatchingBank)
    .withId(feeRecordIdWithNoMatchingBank)
    .withStatus(FEE_RECORD_STATUS.TO_DO)
    .build();
  reportWithNoMatchingBank.feeRecords = [feeRecordWithNoMatchingBank];

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);

    await SqlDbHelper.saveNewEntries('UtilisationReport', [reportWithNoMatchingBank, report]);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrectionTransientFormData');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);
  });

  withSqlAndMongoIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
    sqlPathParameters: ['reportId', 'feeRecordId'],
    mongoPathParameters: ['userId'],
  });

  it(`should return '${HttpStatusCode.NotFound}' when no fee record with the supplied id can be found`, async () => {
    // Arrange
    const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withFeeRecordId(feeRecordId).withUserId(userId).build();
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataEntity);

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId: feeRecordId + 1, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.NotFound}' when no correction form data can be found`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.NotFound}' when no bank can be found matching the bank id on the report`, async () => {
    // Arrange
    const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
      .withFeeRecordId(feeRecordIdWithNoMatchingBank)
      .withUserId(userId)
      .build();
    await SqlDbHelper.saveNewEntry('FeeRecordCorrectionTransientFormData', transientFormDataEntity);

    // Act
    const response = await testApi.get(
      replaceUrlParameterPlaceholders(BASE_URL, { reportId: reportIdWithNoMatchingBank, feeRecordId: feeRecordIdWithNoMatchingBank, userId }),
    );

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it(`should return '${HttpStatusCode.Ok}' and the details of the fee record correction request`, async () => {
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
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { reportId, feeRecordId, userId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual({
      bank: {
        name: bank.name,
        id: bank.id,
      },
      reportPeriod: report.reportPeriod,
      correctionRequestDetails: {
        facilityId: feeRecord.facilityId,
        exporter: feeRecord.exporter,
        reasons: formData.reasons,
        additionalInfo: formData.additionalInfo,
        contactEmailAddresses: bank.paymentOfficerTeam.emails,
      },
    });
  });
});
