import { DbRequestSource, MOCK_AZURE_FILE_INFO, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportReportUploadedEvent } from './report-uploaded.event-handler';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';

describe('handleUtilisationReportReportUploadedEvent', () => {
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

    const updateWithUploadDetailsSpy = jest.spyOn(UtilisationReportRepo, 'updateWithUploadDetails').mockResolvedValue(report);

    // Act
    await handleUtilisationReportReportUploadedEvent(report, {
      azureFileInfo,
      reportCsvData,
      uploadedByUserId,
      requestSource,
    });

    // Assert
    expect(updateWithUploadDetailsSpy).toHaveBeenCalledWith(report, {
      azureFileInfo,
      reportCsvData,
      uploadedByUserId,
      requestSource,
    });
  });
});
