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
    const mockReportMongoId = '5099803df3f4948bd2f98391';

    const getHttpMocks = () =>
      httpMocks.createMocks(
        {
          params: { bankId: mockBankIdParam, _id: mockReportMongoId },
        },
        { eventEmitter: events.EventEmitter },
      );

    it('returns an error response when the reports details do not contain the filename', (done) => {
      // Arrange
      const { res: mockRes, req: mockReq } = getHttpMocks();
      api.getUtilisationReportById.mockResolvedValue({});

      // Act
      getReportDownload(mockReq, mockRes);

      // Assert
      mockRes.on('end', () => {
        expect(console.error).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            message: expect.stringContaining('Failed to get filename'),
          }),
        );

        // eslint-disable-next-line no-underscore-dangle
        expect(mockRes._getStatusCode()).toEqual(500);

        done();
      });
    });

    it('returns an error response when the reports details do not contain the mimetype', (done) => {
      // Arrange
      const { res: mockRes, req: mockReq } = getHttpMocks();
      api.getUtilisationReportById.mockResolvedValue({ azureFileInfo: { filename: 'report.csv' } });

      // Act
      getReportDownload(mockReq, mockRes);

      // Assert
      mockRes.on('end', () => {
        expect(console.error).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            message: expect.stringContaining('Failed to get mimetype'),
          }),
        );

        // eslint-disable-next-line no-underscore-dangle
        expect(mockRes._getStatusCode()).toEqual(500);

        done();
      });
    });

    it('returns the expected headers and file content', (done) => {
      // Arrange
      const { res: mockRes, req: mockReq } = getHttpMocks();

      const mockFilename = 'report.csv';
      const mockMimetype = 'text/csv';

      api.getUtilisationReportById.mockResolvedValue({
        azureFileInfo: { filename: mockFilename, mimetype: mockMimetype },
      });

      const mockFileContent = 'mock file content';
      fileshare.readFile.mockResolvedValue(Buffer.from(mockFileContent));

      // Act
      getReportDownload(mockReq, mockRes);

      // Assert
      mockRes.on('end', () => {
        expect(fileshare.readFile).toHaveBeenCalledWith({
          fileshare: FILESHARES.UTILISATION_REPORTS,
          folder: mockBankIdParam,
          filename: mockFilename,
        });

        /* eslint-disable no-underscore-dangle */
        expect(mockRes._getHeaders()).toEqual({
          'content-disposition': `attachment; filename=${mockFilename}`,
          'content-type': mockMimetype,
        });

        expect(mockRes._getBuffer().toString()).toEqual(mockFileContent);
        /* eslint-enable no-underscore-dangle */

        done();
      });
    });
  });
});
