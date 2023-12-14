jest.mock('../../../services/repositories/banks-repo');

const httpMocks = require('node-mocks-http');
const { getUtilisationReportsReconciliationSummary } = require('./get-utilisation-reports-reconciliation-summary.controller');
const { getAllBanks } = require('../../../services/repositories/banks-repo');
const MOCK_BANKS = require('../../../../api-tests/mocks/banks');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');

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

  // TODO FN-1043 - check for correctly calculated values
  it('returns the reconciliation summary for all banks', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const banks = [MOCK_BANKS.BARCLAYS, MOCK_BANKS.HSBC];

    getAllBanks.mockResolvedValue(banks);

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
      {
        bank: { id: MOCK_BANKS.HSBC.id, name: MOCK_BANKS.HSBC.name },
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      },
    ]);
  });
});
