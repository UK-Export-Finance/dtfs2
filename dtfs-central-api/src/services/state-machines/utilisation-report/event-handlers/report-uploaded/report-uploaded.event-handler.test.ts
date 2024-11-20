import { EntityManager } from 'typeorm';
import {
  REQUEST_PLATFORM_TYPE,
  DbRequestSource,
  MOCK_AZURE_FILE_INFO,
  UtilisationReportEntityMockBuilder,
  UtilisationReportEntity,
  FeeRecordEntity,
  AzureFileInfoEntity,
  UtilisationReportRawCsvData,
  REPORT_NOT_RECEIVED,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportReportUploadedEvent } from './report-uploaded.event-handler';
import { aUtilisationReportRawCsvData, aReportPeriod } from '../../../../../../test-helpers';
import { FacilityUtilisationDataService } from '../../../../facility-utilisation-data/facility-utilisation-data.service';

jest.mock('../../../../facility-utilisation-data/facility-utilisation-data.service');

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

  it('initialises FacilityUtilisationData for all facility ids in the report', async () => {
    // Arrange
    const initialiseFacilityUtilisationDataSpy = jest.spyOn(FacilityUtilisationDataService, 'initialiseFacilityUtilisationData');
    const bankId = '10';
    const reportPeriod = aReportPeriod();
    const report = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED).withReportPeriod(reportPeriod).withBankId(bankId).build();

    const allFacilityIds = ['11111111', '22222222', '33333333'];
    const reportCsvData: UtilisationReportRawCsvData[] = [
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': allFacilityIds[0] },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': allFacilityIds[1] },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': allFacilityIds[2] },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': allFacilityIds[2] },
    ];

    const uploadedByUserId = 'abc123';
    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.PORTAL,
      userId: uploadedByUserId,
    };

    // Act
    await handleUtilisationReportReportUploadedEvent(report, {
      azureFileInfo: MOCK_AZURE_FILE_INFO,
      reportCsvData,
      uploadedByUserId,
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(initialiseFacilityUtilisationDataSpy).toHaveBeenCalledTimes(1);
    expect(initialiseFacilityUtilisationDataSpy).toHaveBeenCalledWith(new Set(allFacilityIds), bankId, reportPeriod, requestSource, mockEntityManager);
  });
});
