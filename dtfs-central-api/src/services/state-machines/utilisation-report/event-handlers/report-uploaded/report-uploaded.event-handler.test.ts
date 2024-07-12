import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  MOCK_AZURE_FILE_INFO,
  UtilisationReportEntityMockBuilder,
  UtilisationReportEntity,
  FeeRecordEntity,
  AzureFileInfoEntity,
  FacilityUtilisationDataEntity,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportReportUploadedEvent } from './report-uploaded.event-handler';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports';
import { aUtilisationReportRawCsvData } from '../../../../../../test-helpers/test-data';

describe('handleUtilisationReportReportUploadedEvent', () => {
  const mockSave = jest.fn();
  const mockExistsBy = jest.fn();

  const mockEntityManager = {
    save: mockSave,
    existsBy: mockExistsBy,
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
    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
    expect(mockSave).toHaveBeenCalledWith(FeeRecordEntity, [], { chunk: 100 });
  });

  it('checks that an entry in the facility utilisation data exists for each facility id in the report csv data', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

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

    mockExistsBy.mockResolvedValue(true);

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
    expect(mockExistsBy).toHaveBeenCalledTimes(reportCsvData.length);
    reportCsvData.forEach(({ 'ukef facility id': facilityId }) => {
      expect(mockExistsBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: facilityId });
    });
  });
});
