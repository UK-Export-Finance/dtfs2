import httpMocks from 'node-mocks-http';
import { PORTAL_LOGIN_STATUS, ReportPeriod, UTILISATION_REPORT_HEADERS, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { MOCK_PORTAL_SESSION_USER } from '../../../../test-mocks/mock-portal-session-user';
import { postUtilisationReportUpload } from '..';
import { getUploadErrors } from '../utilisation-report-upload-errors';
import { getDueReportPeriodsByBankId } from '../utilisation-report-status';
import { extractCsvData } from '../../../../utils/csv-utils';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { filterReportJsonToRelevantKeys } from '../../../../helpers/filterReportJsonToRelevantKeys';
import api from '../../../../api';

jest.mock('../utilisation-report-upload-errors');
jest.mock('../utilisation-report-status');
jest.mock('../../../../utils/csv-utils');
jest.mock('../utilisation-report-filename-validator');
jest.mock('../../../../api');

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('postUtilisationReportUpload', () => {
    const mockDueReportPeriods: (ReportPeriod & { formattedReportPeriod: string })[] = [];

    const sessionUtilisationReport = {
      formattedReportPeriod: 'January to March 2023',
      reportPeriod: { start: { month: 1, year: 2023 }, end: { month: 3, year: 2023 } },
    };

    beforeEach(() => {
      jest.mocked(getDueReportPeriodsByBankId).mockResolvedValueOnce(mockDueReportPeriods);
    });

    it("should render the 'utilisation-report-upload' page if getUploadErrors returns errors", async () => {
      // Arrange
      const sessionUser = MOCK_PORTAL_SESSION_USER;
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: sessionUser, loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA, utilisationReport: sessionUtilisationReport },
      });

      const validationError = {
        text: 'Error',
      };
      const errorSummary = [
        {
          text: 'Error',
          href: '#utilisation-report-file-upload',
        },
      ];

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
        user: sessionUser,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods: mockDueReportPeriods,
      });
    });

    it("should render the 'utilisation-report-upload' page if extractCsvData returns errors", async () => {
      // Arrange
      const sessionUser = MOCK_PORTAL_SESSION_USER;
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: sessionUser, loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA, utilisationReport: sessionUtilisationReport },
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce(null);

      jest.mocked(extractCsvData).mockResolvedValueOnce({
        csvJson: [{}],
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
        user: sessionUser,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods: mockDueReportPeriods,
      });
    });

    it("should render the 'check-the-report' page if validateCsvData returns errors", async () => {
      // Arrange
      const sessionUser = MOCK_PORTAL_SESSION_USER;
      const sessionFile = { originalname: 'filename' };
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: sessionUser, loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA, utilisationReport: sessionUtilisationReport },
        file: sessionFile,
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce(null);

      jest.mocked(extractCsvData).mockResolvedValueOnce({
        csvJson: [{}],
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
      jest.mocked(api.generateValidationErrorsForUtilisationReportData).mockResolvedValueOnce({ csvValidationErrors });

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/check-the-report.njk');
      expect(res._getRenderData()).toEqual({
        validationErrors: csvValidationErrors,
        errorSummary: expectedErrorSummary,
        user: sessionUser,
        filename: sessionFile.originalname,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      });
    });

    it("should redirect to the 'confirm-and-send' url if no file errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: {
          userToken: 'user-token',
          user: MOCK_PORTAL_SESSION_USER,
          loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
          utilisationReport: sessionUtilisationReport,
        },
        file: { originalname: 'filename' },
      });

      jest.mocked(getUploadErrors).mockReturnValueOnce(null);

      jest.mocked(extractCsvData).mockResolvedValueOnce({
        csvJson: [{}],
        fileBuffer: null,
        error: false,
      });

      jest.mocked(api.generateValidationErrorsForUtilisationReportData).mockResolvedValueOnce({ csvValidationErrors: [] });

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/utilisation-report-upload/confirm-and-send');
    });

    it('should filter down the object sent to the API for validation', async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: {
          userToken: 'user-token',
          user: MOCK_PORTAL_SESSION_USER,
          loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
          utilisationReport: sessionUtilisationReport,
        },
        file: { originalname: 'filename' },
      });

      const reportJsonWithExtraKeys: UtilisationReportCsvRowData[] = [
        {
          [UTILISATION_REPORT_HEADERS.BASE_CURRENCY]: { value: 'GBP' },
          keyToRemove: { value: null },
        },
        {
          [UTILISATION_REPORT_HEADERS.BASE_CURRENCY]: { value: 'USD' },
          keyToRemove: { value: 'some additional data that is unnecessary' },
        },
      ];

      jest.mocked(getUploadErrors).mockReturnValueOnce(null);

      jest.mocked(extractCsvData).mockResolvedValueOnce({
        csvJson: reportJsonWithExtraKeys,
        fileBuffer: null,
        error: false,
      });

      jest.spyOn(api, 'generateValidationErrorsForUtilisationReportData').mockResolvedValueOnce({ csvValidationErrors: [] });

      // Act
      await postUtilisationReportUpload(req, res);

      // Assert
      expect(api.generateValidationErrorsForUtilisationReportData).toHaveBeenCalledTimes(1);

      const expected = filterReportJsonToRelevantKeys(reportJsonWithExtraKeys);

      expect(api.generateValidationErrorsForUtilisationReportData).toHaveBeenCalledWith(expected, expect.any(String), expect.any(String));
    });
  });
});
