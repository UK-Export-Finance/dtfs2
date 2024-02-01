const httpMocks = require('node-mocks-http');
const { AxiosError } = require('axios');
const api = require('../../api');
const { getLastUploadedReportByBankId } = require('./last-uploaded.controller');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');

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

  const bankId = '123';

  const lastUploadedReport = {
    bankId,
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
    azureFileInfo,
    uploadedById: '1',
  };

  const sortedReports = [
    {
      bankId,
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
      dateUploaded: '2023-02-01T00:00',
      azureFileInfo,
      uploadedById: '1',
    },
    lastUploadedReport,
    {
      bankId,
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
      azureFileInfo: null,
      uploadedById: '1',
    },
  ];

  describe('getLastUploadedReportByBankId', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: {
          bankId,
        },
      });

    const nonNotReceivedStatuses = Object.values(UTILISATION_REPORT_RECONCILIATION_STATUS).filter(
      (status) => status !== UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
    );

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should throw an error if the api call fails', async () => {
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
      expect(api.getUtilisationReports).toHaveBeenCalledWith(bankId, {
        reportStatuses: nonNotReceivedStatuses,
      });

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toBe(errorStatusCode);
    });

    it('should throw an error if the api does not find any uploaded reports', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(api.getUtilisationReports).mockResolvedValue([]);

      // Act
      await getLastUploadedReportByBankId(req, res);

      // Assert
      expect(api.getUtilisationReports).toHaveBeenCalledWith(bankId, {
        reportStatuses: nonNotReceivedStatuses,
      });

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toBe(500);
    });

    it('should return the last uploaded report', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      jest.mocked(api.getUtilisationReports).mockResolvedValue(sortedReports);

      // Act
      await getLastUploadedReportByBankId(req, res);

      // Assert
      expect(api.getUtilisationReports).toHaveBeenCalledWith(bankId, {
        reportStatuses: nonNotReceivedStatuses,
      });

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getStatusCode()).toBe(200);
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getData()).toEqual(lastUploadedReport);
    });
  });
});
