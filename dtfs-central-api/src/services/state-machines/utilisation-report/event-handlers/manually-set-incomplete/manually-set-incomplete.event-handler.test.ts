import { EntityManager } from 'typeorm';
import {
  AzureFileInfoEntity,
  DbRequestSource,
  MOCK_AZURE_FILE_INFO,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  getDbAuditUpdatedByUserId,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetIncompleteEvent } from '.';

describe('handleUtilisationReportManuallySetIncompleteEvent', () => {
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: 'abc123',
  };
  const updatedByUserId = getDbAuditUpdatedByUserId(requestSource);

  const mockSave = jest.fn();

  const mockRepository = {
    save: mockSave,
  };

  it(`calls the correct repo methods and sets the report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}' when the report was previously uploaded`, async () => {
    // Arrange
    const mockGetRepository = jest.fn().mockReturnValue(mockRepository);
    const mockEntityManager = {
      getRepository: mockGetRepository,
    } as unknown as EntityManager;

    const azureFileInfo = AzureFileInfoEntity.create({ ...MOCK_AZURE_FILE_INFO, requestSource });
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withAzureFileInfo(azureFileInfo).build();

    // Act
    await handleUtilisationReportManuallySetIncompleteEvent(report, {
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockGetRepository).toHaveBeenCalledWith(UtilisationReportEntity);
    expect(mockSave).toHaveBeenCalledWith(report);
    expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);
    expect(report.updatedByUserId).toEqual(updatedByUserId);
  });

  it(`calls the correct repo methods and sets the report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}' when the report was not previously uploaded`, async () => {
    // Arrange
    const mockGetRepository = jest.fn().mockReturnValue(mockRepository);
    const mockEntityManager = {
      getRepository: mockGetRepository,
    } as unknown as EntityManager;

    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withAzureFileInfo(undefined).build();

    // Act
    await handleUtilisationReportManuallySetIncompleteEvent(report, {
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockGetRepository).toHaveBeenCalledWith(UtilisationReportEntity);
    expect(mockSave).toHaveBeenCalledWith(report);
    expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED);
    expect(report.updatedByUserId).toEqual(updatedByUserId);
  });
});
