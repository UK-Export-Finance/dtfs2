import { UtilisationReportEntityMockBuilder, MOCK_AZURE_FILE_INFO } from "@ukef/dtfs2-common/test-helpers";
import { EntityManager } from 'typeorm';
import {
  REQUEST_PLATFORM_TYPE,
  DbRequestSource,
  UtilisationReportEntity,
  FeeRecordEntity,
  AzureFileInfoEntity,
  UtilisationReportRawCsvData,
  REPORT_NOT_RECEIVED,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportReportUploadedEvent } from './report-uploaded.event-handler';

describe('handleUtilisationReportReportUploadedEvent', () => {
  const mockSave = jest.fn();
  const mockExistsBy = jest.fn();

  const mockEntityManager = {
    save: mockSave,
    existsBy: mockExistsBy,
  } as unknown as EntityManager;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls the repo method to update the report', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED).build();

    const azureFileInfo = MOCK_AZURE_FILE_INFO;
    const reportCsvData: UtilisationReportRawCsvData[] = [];
    const uploadedByUserId = 'abc123';
    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.PORTAL,
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
});
