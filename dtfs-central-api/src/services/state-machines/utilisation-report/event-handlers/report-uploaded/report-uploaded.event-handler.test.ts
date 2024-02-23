import { MOCK_AZURE_FILE_INFO, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportReportUploadedEvent } from './report-uploaded.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportReportUploadedEvent', () => {
  // TODO FN-1859 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

    // Act / Assert
    expect(() =>
      handleUtilisationReportReportUploadedEvent(report, {
        azureFileInfo: MOCK_AZURE_FILE_INFO,
        reportCsvData: [],
        uploadedByUserId: 'TODO',
        requestSource: {
          platform: 'PORTAL',
          userId: 'TODO',
        },
      }),
    ).toThrow(NotImplementedError);
  });
});
