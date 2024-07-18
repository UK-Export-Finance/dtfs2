import {
  FacilityUtilisationDataEntityMockBuilder,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { testApi } from '../../test-api';
import { MOCK_TFM_USER } from '../../mocks/test-users/mock-tfm-user';
import { SqlDbHelper } from '../../sql-db-helper';

console.error = jest.fn();

describe('/v1/utilisation-reports/:reportId/keying-data/mark-as-done', () => {
  const getUrl = (reportId: number | string) => `/v1/utilisation-reports/${reportId}/keying-data/mark-as-done`;

  const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId('11111111').build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAll();
    await SqlDbHelper.saveNewEntry('FacilityUtilisationData', facilityUtilisationData);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAll();
  });

  it('returns a 400 when the report id is not a valid id', async () => {
    // Arrange
    const requestBody = {
      user: MOCK_TFM_USER,
      feeRecordIds: [1],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl('invalid_id'));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 400 when the fee record ids are not a valid ids', async () => {
    // Arrange
    const requestBody = {
      user: MOCK_TFM_USER,
      feeRecordIds: ['invalid-id'],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl(1));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 400 when the request does not contain a user', async () => {
    // Arrange
    const requestBody = {
      feeRecordIds: [1],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl(1));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when no report with the supplied id can be found', async () => {
    // Arrange
    const requestBody = {
      user: MOCK_TFM_USER,
      feeRecordIds: [1],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl(1));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 404 when there is a report but without the requested fee record', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: MOCK_TFM_USER,
      feeRecordIds: [1],
    };

    // Act
    const response = await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 200 if the request body is valid', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withFacilityUtilisationData(facilityUtilisationData)
      .withId(1)
      .withStatus('READY_TO_KEY')
      .build();
    report.feeRecords = [feeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: MOCK_TFM_USER,
      feeRecordIds: [1],
    };

    // Act
    const { status } = await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    expect(status).toBe(200);
  });

  it('sets fee record status to RECONCILED', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withFacilityUtilisationData(facilityUtilisationData)
      .withId(1)
      .withStatus('READY_TO_KEY')
      .build();
    report.feeRecords = [feeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: MOCK_TFM_USER,
      feeRecordIds: [1],
    };

    // Act
    await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    const updatedFeeRecord = await SqlDbHelper.manager.findOneBy(FeeRecordEntity, { id: 1 });
    expect(updatedFeeRecord?.status).toEqual('RECONCILED');
  });

  it('sets the report status to RECONCILIATION_COMPLETED if all fee records are now reconciled', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withFacilityUtilisationData(facilityUtilisationData)
      .withId(1)
      .withStatus('READY_TO_KEY')
      .build();
    const anotherFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withFacilityUtilisationData(facilityUtilisationData)
      .withId(2)
      .withStatus('RECONCILED')
      .build();
    report.feeRecords = [feeRecord, anotherFeeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: MOCK_TFM_USER,
      feeRecordIds: [1],
    };

    // Act
    await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    const updatedReport = await SqlDbHelper.manager.findOneBy(UtilisationReportEntity, { id: reportId });
    expect(updatedReport?.status).toEqual('RECONCILIATION_COMPLETED');
  });

  it('does not set the report status to RECONCILIATION_COMPLETED if there are fee records not at RECONCILED status', async () => {
    // Arrange
    const reportId = 1;
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withFacilityUtilisationData(facilityUtilisationData)
      .withId(1)
      .withStatus('READY_TO_KEY')
      .build();
    const anotherFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withFacilityUtilisationData(facilityUtilisationData)
      .withId(2)
      .withStatus('MATCH')
      .build();
    report.feeRecords = [feeRecord, anotherFeeRecord];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = {
      user: MOCK_TFM_USER,
      feeRecordIds: [1],
    };

    // Act
    await testApi.put(requestBody).to(getUrl(reportId));

    // Assert
    const updatedReport = await SqlDbHelper.manager.findOneBy(UtilisationReportEntity, { id: reportId });
    expect(updatedReport?.status).toEqual('RECONCILIATION_IN_PROGRESS');
  });
});
