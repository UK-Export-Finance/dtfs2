import { AzureFileInfoEntity } from '../azure-file-info';
import { MOCK_AZURE_FILE_INFO, UtilisationDataEntityMockBuilder, UtilisationReportEntityMockBuilder } from '../../test-helpers';
import { DbRequestSource, getDbAuditUpdatedByUserId } from '../helpers';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';

describe('UtilisationReportEntity', () => {
  describe('updateReportWithUploadDetails', () => {
    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId: 'abc123',
    };
    const uploadedByUserId = getDbAuditUpdatedByUserId(requestSource);

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
      const utilisationData = UtilisationDataEntityMockBuilder.forReport(report).build();

      // Act
      report.updateWithUploadDetails({
        azureFileInfo,
        data: [utilisationData],
        uploadedByUserId,
        requestSource,
      });

      // Assert
      expect(report.dateUploaded).toEqual(mockDate);
      expect(report.uploadedByUserId).toEqual(uploadedByUserId);
      expect(report.updatedByUserId).toEqual(uploadedByUserId);
      expect(report.azureFileInfo).toEqual(azureFileInfo);
      expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);
      expect(report.data).toEqual([utilisationData]);
    });
  });

  describe('setAsCompleted', () => {
    const requestSource: DbRequestSource = {
      platform: 'TFM',
      userId: 'abc123',
    };
    const updatedByUserId = getDbAuditUpdatedByUserId(requestSource);

    it.each([UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED, UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION] as const)(
      `sets the status to '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}' when the report status is '%s'`,
      (status) => {
        // Arrange
        const report = UtilisationReportEntityMockBuilder.forStatus(status).build();

        // Act
        report.setAsCompleted({ requestSource });

        // Assert
        expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
        expect(report.updatedByUserId).toEqual(updatedByUserId);
      },
    );
  });

  describe('setAsNotCompleted', () => {
    const requestSource: DbRequestSource = {
      platform: 'TFM',
      userId: 'abc123',
    };
    const updatedByUserId = getDbAuditUpdatedByUserId(requestSource);

    it(`sets the report status to '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}' when 'report.azureFileInfo' is defined`, () => {
      // Arrange
      const azureFileInfo = AzureFileInfoEntity.create({ ...MOCK_AZURE_FILE_INFO, requestSource });
      const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withAzureFileInfo(azureFileInfo).build();

      // Act
      report.setAsNotCompleted({ requestSource });

      // Assert
      expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);
      expect(report.updatedByUserId).toEqual(updatedByUserId);
    });

    it(`sets the report status to '${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}' when 'report.azureFileInfo' is undefined`, () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withoutAzureFileInfo().build();

      // Act
      report.setAsNotCompleted({ requestSource });

      // Assert
      expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED);
      expect(report.updatedByUserId).toEqual(updatedByUserId);
    });
  });
});
