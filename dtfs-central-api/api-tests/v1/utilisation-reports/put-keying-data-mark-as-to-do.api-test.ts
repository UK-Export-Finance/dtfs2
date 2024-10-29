import { HttpStatusCode } from 'axios';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { aTfmSessionUser } from '../../../test-helpers';
import { SqlDbHelper } from '../../sql-db-helper';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/keying-data/mark-as-to-do';

describe(`PUT ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string) => BASE_URL.replace(':reportId', reportId.toString());

  beforeAll(async () => {
    await SqlDbHelper.initialize();

    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.put({}).to(url),
  });

  it('returns a 400 when the fee record ids are not a valid ids', async () => {
    // Arrange
    const requestBody = {
      user: aTfmSessionUser(),
      feeRecordIds: ['invalid-id'],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl(1));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('returns a 400 when the request does not contain a user', async () => {
    // Arrange
    const requestBody = {
      feeRecordIds: [1],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl(1));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when no report with the supplied id can be found', async () => {
    // Arrange
    const requestBody = {
      user: aTfmSessionUser(),
      feeRecordIds: [1],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl(1));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('returns a 404 when there is a report but without the requested fee record', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: aTfmSessionUser(),
      feeRecordIds: [1],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('returns a 200 if the request body is valid', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
    report.feeRecords = [feeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: aTfmSessionUser(),
      feeRecordIds: [1],
    };

    // Act
    const { status } = await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    expect(status).toEqual(200);
  });

  it('sets fee record status to READY_TO_KEY, reconciledByUserId to null and dateReconciled to null', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withId(1)
      .withStatus(FEE_RECORD_STATUS.RECONCILED)
      .withReconciledByUserId('abc123')
      .withDateReconciled(new Date('2024'))
      .build();
    report.feeRecords = [feeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: aTfmSessionUser(),
      feeRecordIds: [1],
    };

    // Act
    await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    const updatedFeeRecord = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 1 });
    expect(updatedFeeRecord.status).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
    expect(updatedFeeRecord.reconciledByUserId).toBeNull();
    expect(updatedFeeRecord.dateReconciled).toBeNull();
  });

  it('sets the report status to RECONCILIATION_IN_PROGRESS if it was RECONCILIATION_COMPLETED', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED).withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
    report.feeRecords = [feeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: aTfmSessionUser(),
      feeRecordIds: [1],
    };

    // Act
    await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    const updatedReport = await SqlDbHelper.manager.findOneBy(UtilisationReportEntity, { id: reportId });
    expect(updatedReport?.status).toEqual('RECONCILIATION_IN_PROGRESS');
  });
});
