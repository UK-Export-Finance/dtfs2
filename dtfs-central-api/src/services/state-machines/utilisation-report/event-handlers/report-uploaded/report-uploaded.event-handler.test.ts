import { EntityManager } from 'typeorm';
import {
  REQUEST_PLATFORM_TYPE,
  DbRequestSource,
  MOCK_AZURE_FILE_INFO,
  UtilisationReportEntityMockBuilder,
  UtilisationReportEntity,
  FeeRecordEntity,
  AzureFileInfoEntity,
  FacilityUtilisationDataEntity,
  ReportPeriod,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportReportUploadedEvent } from './report-uploaded.event-handler';
import { calculateInitialUtilisationAndFixedFee } from '../helpers';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports';
import { aUtilisationReportRawCsvData, aTfmFacility } from '../../../../../../test-helpers';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';

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

  it('creates and saves new FacilityUtilisationData entities using the report reportPeriod for the supplied facility ids which do not have existing entries', async () => {
    const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');
    const facility = aTfmFacility();
    findOneByUkefFacilityIdSpy.mockResolvedValue(facility);

    // Arrange
    const reportReportPeriod: ReportPeriod = {
      start: { month: 5, year: 2024 },
      end: { month: 6, year: 2024 },
    };
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withReportPeriod(reportReportPeriod).build();

    const reportCsvDataWithExistingFacilityUtilisationData: UtilisationReportRawCsvData = { ...aUtilisationReportRawCsvData(), 'ukef facility id': '11111111' };
    const reportCsvDataWithoutExistingFacilityUtilisationData: UtilisationReportRawCsvData[] = [
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': '22222222' },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': '33333333' },
    ];
    const uploadedByUserId = 'abc123';
    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.PORTAL,
      userId: uploadedByUserId,
    };

    mockExistsBy.mockImplementation((_entity: unknown, { id }: { id: string }) => {
      switch (id) {
        case '11111111':
          return Promise.resolve(true);
        default:
          return Promise.resolve(false);
      }
    });

    // Act
    await handleUtilisationReportReportUploadedEvent(report, {
      azureFileInfo: MOCK_AZURE_FILE_INFO,
      reportCsvData: [reportCsvDataWithExistingFacilityUtilisationData, ...reportCsvDataWithoutExistingFacilityUtilisationData],
      uploadedByUserId,
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockExistsBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: reportCsvDataWithExistingFacilityUtilisationData['ukef facility id'] });

    const createdFacilityUtilisationDataEntities = reportCsvDataWithoutExistingFacilityUtilisationData.map(async ({ 'ukef facility id': facilityId }) => {
      expect(mockExistsBy).toHaveBeenCalledWith(FacilityUtilisationDataEntity, { id: facilityId });

      const { utilisation, fixedFee } = await calculateInitialUtilisationAndFixedFee(facilityId);

      return FacilityUtilisationDataEntity.createWithUtilisationAndFixedFee({
        id: facilityId,
        reportPeriod: reportReportPeriod,
        requestSource,
        utilisation,
        fixedFee,
      });
    });

    expect(mockSave).toHaveBeenCalledWith(FacilityUtilisationDataEntity, await Promise.all(createdFacilityUtilisationDataEntities), { chunk: 100 });
  });
});
