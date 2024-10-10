const httpMocks = require('node-mocks-http');
const { AxiosError } = require('axios');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('@ukef/dtfs2-common');
const api = require('../../api');
const { getLastUploadedReportByBankId } = require('./last-uploaded.controller');
const { aUtilisationReportResponse } = require('../../../../test-helpers/test-data/utilisation-report');

console.error = jest.fn();

jest.mock('../../api');

describe('controllers/utilisation-report-service/last-uploaded', () => {
  const azureFileInfo = {
    folder: 'test_bank',
    filename: '2021_January_test_bank_utilisation_report.csv',
    fullPath: 'test_bank/2021_January_test_bank_utilisation_report.csv',
    url: 'test.url.csv',
    mimetype: 'text/csv',
  };

  const bankId = '1234abcd';

  const lastUploadedReport = {
    ...aUtilisationReportResponse(),
    reportPeriod: {
      start: {
        month: 2,
        year: 2023,
      },
      end: {
        month: 2,
        year: 2023,
      },
    },
    dateUploaded: '2023-02-01T00:00',
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
    azureFileInfo,
    bankId,
  };

  const sortedReports = [
    // A previously uploaded report
    {
      ...aUtilisationReportResponse(),
      reportPeriod: {
        start: {
          month: 1,
          year: 2023,
        },
        end: {
          month: 1,
          year: 2023,
        },
      },
      dateUploaded: '2023-01-01T00:00',
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
      azureFileInfo,
      bankId,
    },
    // The last uploaded report
    lastUploadedReport,
    // A report which wasn't uploaded, but was marked as completed by a TFM user
    {
      ...aUtilisationReportResponse(),
      reportPeriod: {
        start: {
          month: 3,
          year: 2023,
        },
        end: {
          month: 3,
          year: 2023,
        },
      },
      dateUploaded: '2023-03-01T00:00',
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
      azureFileInfo: null,
      bankId,
    },
    // A report which is due but has not yet been uploaded
    {
      ...aUtilisationReportResponse(),
      reportPeriod: {
        start: {
          month: 4,
          year: 2023,
        },
        end: {
          month: 4,
          year: 2023,
        },
      },
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      azureFileInfo: null,
      dateUploaded: undefined,
      uploadedBy: undefined,
      bankId,
    },
  ];

  describe('getLastUploadedReportByBankId', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: {
          bankId,
        },
      });

    const excludeNotReceived = true;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should return an error response if the api call fails', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      const errorStatusCode = 418;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, {
        status: errorStatusCode,
      });
      jest.mocked(api.getUtilisationReports).mockRejectedValue(axiosError);

      // Act
      await getLastUploadedReportByBankId(req, res);

      // Assert
      expect(api.getUtilisationReports).toHaveBeenCalledWith(bankId, { excludeNotReceived });

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(errorStatusCode);
    });

    it('should return an error response if the api does not find any uploaded reports', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(api.getUtilisationReports).mockResolvedValue([]);

      // Act
      await getLastUploadedReportByBankId(req, res);

      // Assert
      expect(api.getUtilisationReports).toHaveBeenCalledWith(bankId, { excludeNotReceived });

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(500);
    });

    it('should return the last uploaded report', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const uploadedReports = sortedReports.filter(
        (report) => report.status !== UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED && !!report.azureFileInfo,
      );
      jest.mocked(api.getUtilisationReports).mockResolvedValue(uploadedReports);

      // Act
      await getLastUploadedReportByBankId(req, res);

      // Assert
      expect(api.getUtilisationReports).toHaveBeenCalledWith(bankId, { excludeNotReceived });

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toEqual(200);
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual(lastUploadedReport);
    });
  });
});
