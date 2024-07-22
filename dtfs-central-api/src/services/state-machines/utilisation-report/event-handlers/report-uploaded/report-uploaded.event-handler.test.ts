import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  MOCK_AZURE_FILE_INFO,
  UtilisationReportEntityMockBuilder,
  UtilisationReportEntity,
  FeeRecordEntity,
  AzureFileInfoEntity,
  FacilityUtilisationDataEntity,
  ReportPeriod,
  FacilityUtilisationDataEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportReportUploadedEvent } from './report-uploaded.event-handler';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports';
import { aUtilisationReportRawCsvData } from '../../../../../../test-helpers/test-data';

describe('handleUtilisationReportReportUploadedEvent', () => {
  const mockSave = jest.fn();
  const mockFindOneBy = jest.fn();

  const mockEntityManager = {
    save: mockSave,
    findOneBy: mockFindOneBy,
  } as unknown as EntityManager;

  it('calls the repo method to update the report', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

    const azureFileInfo = MOCK_AZURE_FILE_INFO;
    const reportCsvData: UtilisationReportRawCsvData[] = [];
    const uploadedByUserId = 'abc123';
    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId: uploadedByUserId,
    };

    // Act
    await handleUtilisationReportReportUploadedEvent(report, {
      azureFileInfo,
      reportCsvData,
      uploadedByUserId,
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    const azureFileInfoEntity = AzureFileInfoEntity.create({
      ...azureFileInfo,
      requestSource,
    });
    report.updateWithUploadDetails({
      azureFileInfo: azureFileInfoEntity,
      uploadedByUserId,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, [], { chunk: 100 });
  });

  it('creates and saves new FacilityUtilisationData entities using the report reportPeriod when the supplied facility ids do not have existing entries', async () => {
    // Arrange
    const reportReportPeriod: ReportPeriod = {
      start: { month: 5, year: 2024 },
      end: { month: 6, year: 2024 },
    };
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withReportPeriod(reportReportPeriod).build();

    const azureFileInfo = MOCK_AZURE_FILE_INFO;
    const reportCsvData: UtilisationReportRawCsvData[] = [
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': '11111111' },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': '22222222' },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': '33333333' },
    ];
    const uploadedByUserId = 'abc123';
    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId: uploadedByUserId,
    };

    mockFindOneBy.mockResolvedValue(null);

    // Act
    await handleUtilisationReportReportUploadedEvent(report, {
      azureFileInfo,
      reportCsvData,
      uploadedByUserId,
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    const azureFileInfoEntity = AzureFileInfoEntity.create({
      ...azureFileInfo,
      requestSource,
    });
    report.updateWithUploadDetails({
      azureFileInfo: azureFileInfoEntity,
      uploadedByUserId,
      requestSource,
    });

    // Assert
    const facilityUtilisationDataEntities = reportCsvData.map(({ 'ukef facility id': facilityId }) => {
      expect(mockFindOneBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: facilityId });

      return FacilityUtilisationDataEntity.createWithoutUtilisation({
        id: facilityId,
        reportPeriod: reportReportPeriod,
        requestSource,
      });
    });
    expect(mockSave).toHaveBeenCalledWith(FacilityUtilisationDataEntity, facilityUtilisationDataEntities);
  });

  it('does not create new FacilityUtilisationData entities using the report reportPeriod when the supplied facility id has an existing entry', async () => {
    // Arrange
    const reportReportPeriod: ReportPeriod = {
      start: { month: 5, year: 2024 },
      end: { month: 6, year: 2024 },
    };
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withReportPeriod(reportReportPeriod).build();

    const azureFileInfo = MOCK_AZURE_FILE_INFO;
    const reportCsvDataWithExistingFacilityUtilisationData: UtilisationReportRawCsvData = { ...aUtilisationReportRawCsvData(), 'ukef facility id': '11111111' };
    const reportCsvDataWithoutExistingFacilityUtilisationData: UtilisationReportRawCsvData[] = [
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': '22222222' },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': '33333333' },
    ];
    const uploadedByUserId = 'abc123';
    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId: uploadedByUserId,
    };

    const facilityUtilisationDataReportPeriod: ReportPeriod = {
      start: { month: 1, year: 9999 },
      end: { month: 4, year: 9999 },
    };
    const existingFacilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId('11111111')
      .withReportPeriod(facilityUtilisationDataReportPeriod)
      .build();
    mockFindOneBy.mockImplementation((_entity: unknown, { id }: { id: string }) => {
      switch (id) {
        case '11111111':
          return Promise.resolve(existingFacilityUtilisationData);
        default:
          return Promise.resolve(null);
      }
    });

    // Act
    await handleUtilisationReportReportUploadedEvent(report, {
      azureFileInfo,
      reportCsvData: [reportCsvDataWithExistingFacilityUtilisationData, ...reportCsvDataWithoutExistingFacilityUtilisationData],
      uploadedByUserId,
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    const azureFileInfoEntity = AzureFileInfoEntity.create({
      ...azureFileInfo,
      requestSource,
    });
    report.updateWithUploadDetails({
      azureFileInfo: azureFileInfoEntity,
      uploadedByUserId,
      requestSource,
    });

    // Assert
    expect(mockFindOneBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: reportCsvDataWithExistingFacilityUtilisationData['ukef facility id'] });

    const createdFacilityUtilisationDataEntities = reportCsvDataWithoutExistingFacilityUtilisationData.map(({ 'ukef facility id': facilityId }) => {
      expect(mockFindOneBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: facilityId });

      return FacilityUtilisationDataEntity.createWithoutUtilisation({
        id: facilityId,
        reportPeriod: reportReportPeriod,
        requestSource,
      });
    });
    expect(mockSave).toHaveBeenCalledWith(FacilityUtilisationDataEntity, [existingFacilityUtilisationData, ...createdFacilityUtilisationDataEntities]);
  });
});
