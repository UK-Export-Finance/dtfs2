const httpMocks = require('node-mocks-http');
const { MOCK_PORTAL_SESSION_USER } = require('../../../test-mocks/mock-portal-session-user');
const { postUtilisationReportUpload } = require('.');
const { getUploadErrors } = require('./utilisation-report-upload-errors');
const { getDueReportPeriodsByBankId } = require('./utilisation-report-status');
const { extractCsvData } = require('../../../utils/csv-utils');
const { PRIMARY_NAV_KEY } = require('../../../constants');
const api = require('../../../api');

jest.mock('./utilisation-report-upload-errors');
jest.mock('./utilisation-report-status');
jest.mock('../../../utils/csv-utils');
jest.mock('./utilisation-report-filename-validator');
jest.mock('../../../api');

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('postUtilisationReportUpload', () => {
    const mockDueReportPeriods = [];

    beforeEach(() => {
      jest.mocked(getDueReportPeriodsByBankId).mockReturnValueOnce(mockDueReportPeriods);
    });

    it("renders the 'utilisation-report-upload' page if getUploadErrors returns errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_PORTAL_SESSION_USER, logInStatus: 'Valid 2FA' },
      });

      const validationError = {
        text: 'Error',
      };
      const errorSummary = {
        text: 'Error',
        href: '#utilisation-report-file-upload',
      };
      jest.mocked(getUploadErrors).mockReturnValueOnce({
        uploadValidationError: validationError,
        uploadErrorSummary: errorSummary,
      });

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk');
      expect(res._getRenderData()).toEqual({
        validationError,
        errorSummary,
        user: req.session.user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods: mockDueReportPeriods,
      });
    });

    it("renders the 'utilisation-report-upload' page if extractCsvData returns errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_PORTAL_SESSION_USER, logInStatus: 'Valid 2FA' },
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce(null);

      jest.mocked(extractCsvData).mockReturnValueOnce({
        csvJson: null,
        fileBuffer: null,
        error: true,
      });

      const expectedExtractDataErrorSummary = [
        {
          text: 'The selected file could not be uploaded, try again and make sure it is not password protected',
          href: '#utilisation-report-file-upload',
        },
      ];
      const expectedExtractDataError = {
        text: 'The selected file could not be uploaded, try again and make sure it is not password protected',
      };

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk');
      expect(res._getRenderData()).toEqual({
        validationError: expectedExtractDataError,
        errorSummary: expectedExtractDataErrorSummary,
        user: req.session.user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods: mockDueReportPeriods,
      });
    });

    it("renders the 'check-the-report' page if validateCsvData returns errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_PORTAL_SESSION_USER, logInStatus: 'Valid 2FA' },
        file: { originalname: 'filename' },
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce(null);

      jest.mocked(extractCsvData).mockReturnValueOnce({
        csvJson: null,
        fileBuffer: null,
        error: false,
      });

      const expectedErrorSummary = [
        {
          text: 'You must correct these errors before you can upload the report',
          href: '#validation-errors-table',
        },
      ];

      const csvValidationErrors = [
        {
          errorMessage: 'Error',
        },
      ];
      jest.mocked(api.generateValidationErrorsForUtilisationReportData).mockReturnValueOnce({ csvValidationErrors });

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/check-the-report.njk');
      expect(res._getRenderData()).toEqual({
        validationErrors: csvValidationErrors,
        errorSummary: expectedErrorSummary,
        user: req.session.user,
        filename: req.file.originalname,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      });
    });

    it("redirects to the 'confirm-and-send' url if no file errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_PORTAL_SESSION_USER, logInStatus: 'Valid 2FA' },
        file: { originalname: 'filename' },
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce(null);

      jest.mocked(extractCsvData).mockReturnValueOnce({
        csvJson: null,
        fileBuffer: null,
        error: false,
      });

      jest.mocked(api.generateValidationErrorsForUtilisationReportData).mockReturnValueOnce({ csvValidationErrors: [] });

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/utilisation-report-upload/confirm-and-send');
    });
  });
});
