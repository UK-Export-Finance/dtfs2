import { AzureFileInfoEntity } from '../azure-file-info';
import { MOCK_AZURE_FILE_INFO, UtilisationReportEntityMockBuilder } from '../../test-helpers';
import { DbRequestSource } from '../helpers';
import { REQUEST_PLATFORM_TYPE, UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';

describe('UtilisationReportEntity', () => {
  describe('updateReportWithUploadDetails', () => {
    const uploadedByUserId = 'abc123';

    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.PORTAL,
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
      const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED).build();

      // Act
      report.updateWithUploadDetails({
        azureFileInfo,
        uploadedByUserId,
        requestSource,
      });

      // Assert
      expect(report.dateUploaded).toEqual(mockDate);
      expect(report.uploadedByUserId).toEqual(uploadedByUserId);
      expect(report.azureFileInfo).toEqual(azureFileInfo);
      expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);

      expect(report.lastUpdatedByIsSystemUser).toEqual(false);
      expect(report.lastUpdatedByPortalUserId).toEqual(uploadedByUserId);
      expect(report.lastUpdatedByTfmUserId).toBeNull();
    });
  });

  describe('updateWithStatus', () => {
    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.TFM,
      userId: 'abc123',
    };

    const allStatuses = Object.values(UTILISATION_REPORT_RECONCILIATION_STATUS);
    it.each(allStatuses)(`sets the report status to '%s' and updates the 'lastUpdatedBy...' fields`, (status) => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED).build();

      // Act
      report.updateWithStatus({ status, requestSource });

      // Assert
      expect(report.status).toEqual(status);
      expect(report.lastUpdatedByIsSystemUser).toEqual(false);
      expect(report.lastUpdatedByPortalUserId).toBeNull();
      expect(report.lastUpdatedByTfmUserId).toEqual(requestSource.userId);
    });
  });
});
