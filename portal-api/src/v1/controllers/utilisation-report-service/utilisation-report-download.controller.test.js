const httpMocks = require('node-mocks-http');
const events = require('events');
const { getReportDownload } = require('.');
const fileshare = require('../../../drivers/fileshare');
const api = require('../../api');
const { FILESHARES } = require('../../../constants/file-upload');

jest.mock('../../../drivers/fileshare');
jest.mock('../../api');

console.error = jest.fn();

describe('controllers/utilisation-report-service/utilisation-report-download', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getReportDownload', () => {
    const mockBankIdParam = '956';
    const mockReportId = 10;

    const getHttpMocks = () =>
      httpMocks.createMocks(
        {
          params: { bankId: mockBankIdParam, id: mockReportId },
        },
        { eventEmitter: events.EventEmitter },
      );

    it('returns an error response when the reports details do not contain the filename', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReportById.mockResolvedValue({ bankId: mockBankIdParam });

      // Act
      await getReportDownload(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('Failed to get filename'),
        }),
      );

      expect(res._getStatusCode()).toEqual(500);
    });

    it('returns an error response when the reports details do not contain the mimetype', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReportById.mockResolvedValue({
        bankId: mockBankIdParam,
        azureFileInfo: { filename: 'report.csv' },
      });

      // Act
      await getReportDownload(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('Failed to get mimetype'),
        }),
      );

      expect(res._getStatusCode()).toEqual(500);
    });

    it('returns an error response when Azure fileshare returns an error response', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReportById.mockResolvedValue({
        bankId: mockBankIdParam,
        azureFileInfo: { filename: 'report.csv', mimetype: 'text/csv' },
      });

      const errorMessage = 'Failed to authenticate';
      fileshare.readFile.mockResolvedValue({
        error: { errorCode: 'AUTH_ERROR', message: errorMessage },
      });

      // Act
      await getReportDownload(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining(errorMessage),
        }),
      );

      expect(res._getStatusCode()).toEqual(500);
    });

    it('returns an error response when Azure fileshare throws and error', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      api.getUtilisationReportById.mockResolvedValue({
        bankId: mockBankIdParam,
        azureFileInfo: { filename: 'report.csv', mimetype: 'text/csv' },
      });

      const azureError = new Error('Failed to authenticate');
      fileshare.readFile.mockRejectedValue(new Error('Failed to authenticate'));

      // Act
      await getReportDownload(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledWith(expect.any(String), azureError);

      expect(res._getStatusCode()).toEqual(500);
    });

    it('returns the expected headers and file content', (done) => {
      // Arrange
      const { req, res } = getHttpMocks();

      const mockFilename = 'report.csv';
      const mockMimetype = 'text/csv';

      api.getUtilisationReportById.mockResolvedValue({
        bankId: mockBankIdParam,
        azureFileInfo: { filename: mockFilename, mimetype: mockMimetype },
      });

      const mockFileContent = 'mock file content';
      fileshare.readFile.mockResolvedValue(Buffer.from(mockFileContent));

      // Act
      getReportDownload(req, res);

      // Assert
      res.on('end', () => {
        expect(fileshare.readFile).toHaveBeenCalledWith({
          fileshare: FILESHARES.UTILISATION_REPORTS,
          folder: mockBankIdParam,
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
