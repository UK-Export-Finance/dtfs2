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

  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  describe('when a report has been uploaded', () => {
    const azureFileInfo = AzureFileInfoEntity.create({ ...MOCK_AZURE_FILE_INFO, requestSource });
    const expectedNewStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;

    it(`sets the report status to '${expectedNewStatus}' and saves the report using the transaction entity manager`, async () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withAzureFileInfo(azureFileInfo).build();

      // Act
      await handleUtilisationReportManuallySetIncompleteEvent(report, {
        requestSource,
        transactionEntityManager: mockEntityManager,
      });

      // Assert
      expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
      expect(report.status).toEqual(expectedNewStatus);
      expect(report.updatedByUserId).toEqual(updatedByUserId);
    });
  });

  describe('when a report has not been uploaded', () => {
    const azureFileInfo = undefined;
    const expectedNewStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED;

    it(`sets the report status to '${expectedNewStatus}' and saves the report using the transaction entity manager`, async () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withAzureFileInfo(azureFileInfo).build();

      // Act
      await handleUtilisationReportManuallySetIncompleteEvent(report, {
        requestSource,
        transactionEntityManager: mockEntityManager,
      });

      // Assert
      expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
      expect(report.status).toEqual(expectedNewStatus);
      expect(report.updatedByUserId).toEqual(updatedByUserId);
    });
  });
});
