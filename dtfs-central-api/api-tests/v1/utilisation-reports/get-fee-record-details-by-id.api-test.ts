import { Response } from 'supertest';
import { HttpStatusCode, getUri } from 'axios';
import { FeeRecordEntityMockBuilder, RECONCILIATION_IN_PROGRESS, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { GetFeeRecordDetailsResponseBody } from '../../../src/v1/controllers/utilisation-report-service/get-fee-record-details-by-id.controller';

interface CustomResponse extends Response {
  body: GetFeeRecordDetailsResponseBody;
}

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/fee-record/:feeRecordId';

describe(`GET ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string, feeRecordId: number | string) =>
    getUri({
      url: BASE_URL.replace(':reportId', reportId.toString()).replace(':feeRecordId', feeRecordId.toString()),
    });

  const reportPeriod: ReportPeriod = {
    start: { month: 1, year: 2024 },
    end: { month: 1, year: 2024 },
  };

  const reportId = 1;
  const feeRecordId = 1;

  const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withReportPeriod(reportPeriod)
    .build();

  const feeRecord = FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport).withId(1).build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
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

  it('returns a 200 with a valid report and fee record id', async () => {
    // Act
    const response: CustomResponse = await testApi.get(getUrl(reportId, feeRecordId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });
});
