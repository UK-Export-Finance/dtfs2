jest.mock('../../../services/repositories/banks-repo');
jest.mock('../../../services/repositories/utilisation-reports-repo');
jest.mock('../../../services/repositories/utilisation-data-repo');

const httpMocks = require('node-mocks-http');
const { getUtilisationReportsReconciliationSummary } = require('./get-utilisation-reports-reconciliation-summary.controller');
const { getAllBanks } = require('../../../services/repositories/banks-repo');
const { getUtilisationReportDetailsByBankIdMonthAndYear } = require('../../../services/repositories/utilisation-reports-repo');
const { getAllUtilisationDataForReport } = require('../../../services/repositories/utilisation-data-repo');
const MOCK_BANKS = require('../../../../api-tests/mocks/banks');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');
const { MOCK_UTILISATION_REPORT } = require('../../../../api-tests/mocks/utilisation-reports');
const { getMockUtilisationDataForReport } = require('../../../../api-tests/mocks/utilisation-data');

console.error = jest.fn();

describe('getUtilisationReportsReconciliationSummary', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const getHttpMocks = () =>
    httpMocks.createMocks({
      params: { submissionMonth: '2023-11' },
    });

  it('returns a 500 response if any errors are thrown', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const getBanksError = new Error('Failed to connect to DB');
    getAllBanks.mockRejectedValue(getBanksError);

    // Act
    await getUtilisationReportsReconciliationSummary(req, res);

    // Assert
    const expectedErrorMessage = 'Failed to get utilisation reports reconciliation summary';

    expect(console.error).toHaveBeenCalledWith(expectedErrorMessage, getBanksError);

    expect(res.statusCode).toEqual(500);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual(expectedErrorMessage);
  });

  it("returns a minimal 'REPORT_NOT_RECEIVED' summary when the bank has not yet submitted their report", async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const banks = [MOCK_BANKS.BARCLAYS];
    getAllBanks.mockResolvedValue(banks);

    getUtilisationReportDetailsByBankIdMonthAndYear.mockResolvedValue(null);

    // Act
    await getUtilisationReportsReconciliationSummary(req, res);

    // Assert
    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual([
      {
        bank: { id: MOCK_BANKS.BARCLAYS.id, name: MOCK_BANKS.BARCLAYS.name },
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      },
    ]);
  });

  it('returns the reconciliation summary for all banks', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const banks = [MOCK_BANKS.BARCLAYS, MOCK_BANKS.HSBC];
    getAllBanks.mockResolvedValue(banks);

    const barclaysReport = {
      ...MOCK_UTILISATION_REPORT,
      bank: { id: MOCK_BANKS.BARCLAYS.id, name: MOCK_BANKS.BARCLAYS.name },
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS,
    };
    getUtilisationReportDetailsByBankIdMonthAndYear.mockImplementation(async (bankId) => {
      switch (bankId) {
        case MOCK_BANKS.BARCLAYS.id:
          return barclaysReport;
        case MOCK_BANKS.HSBC.id:
        default:
          return null;
      }
    });

    const utilisationData = getMockUtilisationDataForReport(barclaysReport);
    getAllUtilisationDataForReport.mockResolvedValue([utilisationData]);

    // Act
    await getUtilisationReportsReconciliationSummary(req, res);

    // Assert
    expect(res.statusCode).toEqual(200);
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getData()).toEqual([
      {
        reportId: barclaysReport._id,
        bank: { id: MOCK_BANKS.BARCLAYS.id, name: MOCK_BANKS.BARCLAYS.name },
        status: barclaysReport.status,
        dateUploaded: barclaysReport.dateUploaded,
        totalFeesReported: 1,
        reportedFeesLeftToReconcile: 1,
        isPlaceholderReport: false,
      },
      {
        bank: { id: MOCK_BANKS.HSBC.id, name: MOCK_BANKS.HSBC.name },
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      },
    ]);
  });
});
