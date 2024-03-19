import { AzureFileInfoEntity } from '../azure-file-info';
import { MOCK_AZURE_FILE_INFO, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '../../test-helpers';
import { DbRequestSource } from '../helpers';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';

describe('UtilisationReportEntity', () => {
  describe('updateReportWithUploadDetails', () => {
    const uploadedByUserId = 'abc123';

    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId: uploadedByUserId,
    };

    const mockDate = new Date('2024-01');

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('populates the report with the upload details and updates the other relevant fields', () => {
      // Arrange
      const azureFileInfo = AzureFileInfoEntity.create({ ...MOCK_AZURE_FILE_INFO, requestSource });
      const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();
      const feeRecord = FeeRecordEntityMockBuilder.forReport(report).build();

      // Act
      report.updateWithUploadDetails({
        azureFileInfo,
        feeRecords: [feeRecord],
        uploadedByUserId,
        requestSource,
      });

      // Assert
      expect(report.dateUploaded).toEqual(mockDate);
      expect(report.uploadedByUserId).toEqual(uploadedByUserId);
      expect(report.azureFileInfo).toEqual(azureFileInfo);
      expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);
      expect(report.feeRecords).toEqual([feeRecord]);

      expect(report.lastUpdatedByIsSystemUser).toBe(false);
      expect(report.lastUpdatedByPortalUserId).toBe(uploadedByUserId);
      expect(report.lastUpdatedByTfmUserId).toBeNull();
    });
  });

  describe('updateWithStatus', () => {
    const requestSource: DbRequestSource = {
      platform: 'TFM',
      userId: 'abc123',
    };

    const allStatuses = Object.values(UTILISATION_REPORT_RECONCILIATION_STATUS);
    it.each(allStatuses)(`sets the report status to '%s' and updated the activity logs fields`, (status) => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

      // Act
      report.updateWithStatus({ status, requestSource });

      // Assert
      expect(report.status).toBe(status);
      expect(report.lastUpdatedByIsSystemUser).toBe(false);
      expect(report.lastUpdatedByPortalUserId).toBeNull();
      expect(report.lastUpdatedByTfmUserId).toBe(requestSource.userId);
    });
  });
});
