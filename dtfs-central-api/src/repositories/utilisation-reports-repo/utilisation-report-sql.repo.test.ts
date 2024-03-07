import {
  AzureFileInfoEntity,
  DbRequestSource,
  MOCK_AZURE_FILE_INFO,
  UtilisationReportEntity,
} from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '.';
import { MOCK_UTILISATION_REPORT_RAW_CSV_DATA } from '../../../api-tests/mocks/utilisation-reports/utilisation-report-raw-csv-data';
import { utilisationDataCsvRowToSqlEntity } from '../../helpers';

describe('UtilisationReportRepo', () => {
  describe('updateWithUploadDetails', () => {
    const mockDate = new Date('2024-01');

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('updates the report with the supplied fields', async () => {
      // Arrange
      const bankId = '123';
      const reportPeriod /*: ReportPeriod */ = {
        start: {
          month: 1,
          year: 2024,
        },
        end: {
          month: 1,
          year: 2024,
        },
      };
      const existingReport = UtilisationReportEntity.createNotReceived({
        bankId,
        reportPeriod,
        requestSource: {
          platform: 'SYSTEM',
        },
      });

      const uploadedByUserId = 'abc123';
      const requestSource: DbRequestSource = {
        platform: 'PORTAL',
        userId: uploadedByUserId,
      };

      const reportCsvData = MOCK_UTILISATION_REPORT_RAW_CSV_DATA;
      const utilisationDataEntity = utilisationDataCsvRowToSqlEntity({
        dataEntry: reportCsvData,
        requestSource,
      });

      const azureFileInfo = MOCK_AZURE_FILE_INFO;
      const azureFileInfoEntity = AzureFileInfoEntity.create({
        ...azureFileInfo,
        requestSource,
      });

      const expectedUpdatedReport = existingReport.toReportWithUploadDetails({
        azureFileInfo: azureFileInfoEntity,
        data: [utilisationDataEntity],
        uploadedByUserId,
        requestSource,
      });

      const saveSpy = jest.spyOn(UtilisationReportRepo, 'save').mockResolvedValue(expectedUpdatedReport);

      // Act
      await UtilisationReportRepo.updateWithUploadDetails(existingReport, {
        azureFileInfo,
        reportCsvData: [reportCsvData],
        uploadedByUserId,
        requestSource,
      });

      // Assert
      expect(saveSpy).toHaveBeenCalledWith(expectedUpdatedReport);
    });
  });
});
