const httpMocks = require('node-mocks-http');
const { MOCK_PORTAL_SESSION_USER } = require('../../../test-mocks/mock-portal-session-user');
const { postUtilisationReportUpload } = require('.');
const { getUploadErrors } = require('./utilisation-report-upload-errors');
const { getDueReportDates } = require('./utilisation-report-status');
const { validateCsvData } = require('./utilisation-report-validator');
const { extractCsvData } = require('../../../utils/csv-utils');

jest.mock('./utilisation-report-upload-errors');
jest.mock('./utilisation-report-status');
jest.mock('../../../utils/csv-utils');
jest.mock('./utilisation-report-validator');

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('postUtilisationReportUpload', () => {
    it("renders the 'utilisation-report-upload' page if getUploadErrors returns errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_PORTAL_SESSION_USER },
      });

      jest.mocked(getUploadErrors)
        .mockReturnValueOnce({
          uploadErrorSummary: {
            text: 'Error',
            href: '#utilisation-report-file-upload',
          },
          uploadValidationError: {
            text: 'Error',
          },
        });

      jest.mocked(getDueReportDates).mockReturnValueOnce([]);

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk');
      /* eslint-enable no-underscore-dangle */
    });

    it("renders the 'utilisation-report-upload' page if extractCsvData returns errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_PORTAL_SESSION_USER },
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce({});

      jest.mocked(extractCsvData)
        .mockReturnValueOnce({
          csvJson: null,
          fileBuffer: null,
          error: true
        });

      jest.mocked(getDueReportDates).mockReturnValueOnce([]);

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk');
      /* eslint-enable no-underscore-dangle */
    });

    it("renders the 'check-the-report' page if validateCsvData returns errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_PORTAL_SESSION_USER },
        file: { originalname: 'filename'},
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce({});

      jest.mocked(extractCsvData)
        .mockReturnValueOnce({
          csvJson: null,
          fileBuffer: null,
          error: false
        });

      jest.mocked(validateCsvData)
        .mockReturnValueOnce([{
          errorMessage: 'Error'
        }]);

      jest.mocked(getDueReportDates).mockReturnValueOnce([]);

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/check-the-report.njk');
      /* eslint-enable no-underscore-dangle */
    });

    it("redirects to the 'confirm-and-send' url if no file errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_PORTAL_SESSION_USER },
        file: { originalname: 'filename'},
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce({});

      jest.mocked(extractCsvData)
        .mockReturnValueOnce({
          csvJson: null,
          fileBuffer: null,
          error: false
        });

      jest.mocked(validateCsvData)
        .mockReturnValueOnce([]);

      jest.mocked(getDueReportDates).mockReturnValueOnce([]);

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRedirectUrl()).toEqual('/utilisation-report-upload/confirm-and-send');
      /* eslint-enable no-underscore-dangle */
    });
  });
});