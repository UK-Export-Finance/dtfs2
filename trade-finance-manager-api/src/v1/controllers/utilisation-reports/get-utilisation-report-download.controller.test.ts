import httpMocks from 'node-mocks-http';
import events from 'events';
import api from '../../api';
import { getUtilisationReportDownload } from './get-utilisation-report-download.controller';
import fileshare from '../../../drivers/fileshare';
import { FILESHARES } from '../../../constants';
import { UtilisationReportResponseBody } from '../../api-response-types/utilisation-report-response-body';

jest.mock('../../api');
jest.mock('../../../drivers/fileshare');

console.error = jest.fn();

describe('get-utilisation-report-download controller', () => {
  describe('getUtilisationReportDownload', () => {
    const mockReportId = '5099';

    const getHttpMocks = () =>
      httpMocks.createMocks(
        {
          params: { id: mockReportId },
        },
        { eventEmitter: events.EventEmitter },
      );

    it('returns an error response when the report details do not contain the folder', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(api.getUtilisationReportById).mockResolvedValue({} as UtilisationReportResponseBody);

      // Act
      await getUtilisationReportDownload(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('Failed to get folder') as string,
        }),
      );

      expect(res._getStatusCode()).toEqual(500);
    });

    it('returns an error response when the reports details do not contain the filename', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(api.getUtilisationReportById).mockResolvedValue({
        azureFileInfo: { folder: '987' },
      } as UtilisationReportResponseBody);

      // Act
      await getUtilisationReportDownload(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('Failed to get filename') as string,
        }),
      );

      expect(res._getStatusCode()).toEqual(500);
    });

    it('returns an error response when the reports details do not contain the mimetype', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(api.getUtilisationReportById).mockResolvedValue({
        azureFileInfo: { folder: '987', filename: 'report.csv' },
      } as UtilisationReportResponseBody);

      // Act
      await getUtilisationReportDownload(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('Failed to get mimetype') as string,
        }),
      );

      expect(res._getStatusCode()).toEqual(500);
    });

    it('returns an error response when Azure fileshare throws and error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(api.getUtilisationReportById).mockResolvedValue({
        azureFileInfo: { folder: '987', filename: 'report.csv', mimetype: 'text/csv' },
      } as UtilisationReportResponseBody);

      const azureError = new Error('Failed to authenticate');
      jest.mocked(fileshare.readFile).mockRejectedValue(new Error('Failed to authenticate'));

      // Act
      await getUtilisationReportDownload(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledWith(expect.any(String), azureError);

      expect(res._getStatusCode()).toEqual(500);
    });

    it('returns the expected headers and file content', (done) => {
      // Arrange
      const { req, res } = getHttpMocks();

      const mockFolder = '987';
      const mockFilename = 'report.csv';
      const mockMimetype = 'text/csv';

      jest.mocked(api.getUtilisationReportById).mockResolvedValue({
        azureFileInfo: { folder: mockFolder, filename: mockFilename, mimetype: mockMimetype },
      } as UtilisationReportResponseBody);

      const mockFileContent = 'mock file content';
      jest.mocked(fileshare.readFile).mockResolvedValue(Buffer.from(mockFileContent));

      // Act
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      getUtilisationReportDownload(req, res);

      // Assert
      res.on('end', () => {
        expect(fileshare.readFile).toHaveBeenCalledWith({
          fileshare: FILESHARES.UTILISATION_REPORTS,
          folder: mockFolder,
          filename: mockFilename,
        });

        expect(res._getHeaders()).toEqual({
          'content-disposition': `attachment; filename=${mockFilename}`,
          'content-type': mockMimetype,
        });

        expect(res._getBuffer().toString()).toEqual(mockFileContent);

        done();
      });
    });
  });
});
