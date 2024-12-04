import { HttpStatusCode } from 'axios';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_COMPLETED,
  RECONCILIATION_IN_PROGRESS,
  TfmSessionUser,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { aTfmSessionUser } from '../../../test-helpers';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/keying-data/mark-as-done';

describe(`PUT ${BASE_URL}`, () => {
  let tfmSessionUser: TfmSessionUser;

  const getUrl = (reportId: number | string) => BASE_URL.replace(':reportId', reportId.toString());

  beforeAll(async () => {
    await SqlDbHelper.initialize();

    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  beforeEach(() => {
    tfmSessionUser = aTfmSessionUser();
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
      user: tfmSessionUser,
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
      user: tfmSessionUser,
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
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: tfmSessionUser,
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
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build();
    report.feeRecords = [feeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: tfmSessionUser,
      feeRecordIds: [1],
    };

    // Act
    const { status } = await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    expect(status).toEqual(200);
  });

  it('sets fee record status to RECONCILED, reconciledByUserId to the user who performed the action and the dateReconciled to now', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withId(1)
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withReconciledByUserId(null)
      .withDateReconciled(null)
      .build();
    report.feeRecords = [feeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: tfmSessionUser,
      feeRecordIds: [1],
    };

    // Act
    await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    const updatedFeeRecord = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 1 });
    expect(updatedFeeRecord.status).toEqual(FEE_RECORD_STATUS.RECONCILED);
    expect(updatedFeeRecord.reconciledByUserId).toEqual(tfmSessionUser._id.toString());
    expect(updatedFeeRecord.dateReconciled).not.toBeNull();
  });

  it('sets the report status to RECONCILIATION_COMPLETED if all fee records are now reconciled', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build();
    const anotherFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
    report.feeRecords = [feeRecord, anotherFeeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: tfmSessionUser,
      feeRecordIds: [1],
    };

    // Act
    await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    const updatedReport = await SqlDbHelper.manager.findOneBy(UtilisationReportEntity, { id: reportId });
    expect(updatedReport?.status).toEqual(RECONCILIATION_COMPLETED);
  });

  it('does not set the report status to RECONCILIATION_COMPLETED if there are fee records not at RECONCILED status', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build();
    const anotherFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.MATCH).build();
    report.feeRecords = [feeRecord, anotherFeeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: tfmSessionUser,
      feeRecordIds: [1],
    };

    // Act
    await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    const updatedReport = await SqlDbHelper.manager.findOneBy(UtilisationReportEntity, { id: reportId });
    expect(updatedReport?.status).toEqual(RECONCILIATION_IN_PROGRESS);
  });
});
