import { Response } from 'supertest';
import { HttpStatusCode, getUri } from 'axios';
import { Bank, FeeRecordEntityMockBuilder, RECONCILIATION_IN_PROGRESS, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { GetFeeRecordResponseBody } from '../../../src/v1/controllers/utilisation-report-service/get-fee-record.controller';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aBank } from '../../../test-helpers';

interface CustomResponse extends Response {
  body: GetFeeRecordResponseBody;
}

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/fee-records/:feeRecordId';

describe(`GET ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string, feeRecordId: number | string) =>
    getUri({
      url: BASE_URL.replace(':reportId', reportId.toString()).replace(':feeRecordId', feeRecordId.toString()),
    });

  const bankId = '123';
  const bankName = 'Test bank';
  const bank: Bank = {
    ...aBank(),
    id: bankId,
    name: bankName,
  };

  const reportPeriod: ReportPeriod = {
    start: { month: 1, year: 2024 },
    end: { month: 1, year: 2024 },
  };

  const reportId = 1;
  const feeRecordId = 2;

  const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withReportPeriod(reportPeriod)
    .build();

  const feeRecord = FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport).withId(feeRecordId).build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntry('UtilisationReport', reconciliationInProgressReport);
    await SqlDbHelper.saveNewEntry('FeeRecord', feeRecord);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecord');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
  });

  it('returns a 404 when no fee record with the supplied id can be found', async () => {
    // Act
    const response: CustomResponse = await testApi.get(getUrl(reportId, feeRecordId + 1));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the fee record is not attached to a report with the supplied id', async () => {
    // Act
    const response: CustomResponse = await testApi.get(getUrl(reportId + 1, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the bank with the same id as the report cannot be found', async () => {
    // Arrange
    const anotherReportId = 11;
    const anotherFeeRecordId = 12;
    const reportWithDifferentBankId = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
      .withId(anotherReportId)
      .withBankId('456')
      .build();
    const feeRecordWithDifferingBank = FeeRecordEntityMockBuilder.forReport(reportWithDifferentBankId).withId(anotherFeeRecordId).build();

    await SqlDbHelper.saveNewEntry('UtilisationReport', reportWithDifferentBankId);
    await SqlDbHelper.saveNewEntry('FeeRecord', feeRecordWithDifferingBank);

    // Act
    const response: CustomResponse = await testApi.get(getUrl(anotherReportId, anotherFeeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('returns a 200 with valid fee record', async () => {
    // Act
    const response: CustomResponse = await testApi.get(getUrl(reportId, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(response.body).toEqual({
      bank: {
        id: bankId,
        name: bankName,
      },
      exporter: 'test exporter',
      facilityId: '12345678',
      id: feeRecordId,
      reportPeriod,
    });
  });
});
