import { Request } from 'express';
import httpMocks from 'node-mocks-http';
import { getUtilisationReportsReconciliationSummary } from './index';
import { generateReconciliationSummaries } from './helpers';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } from '../../../../../api-tests/mocks/utilisation-reports/utilisation-report-reconciliation-summary';

jest.mock('./helpers');

console.error = jest.fn();

describe('getUtilisationReportsReconciliationSummary', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const getHttpMocks = () =>
    httpMocks.createMocks<Request<{ submissionMonth: string }>>({
      params: { submissionMonth: '2023-11' },
    });

  it('returns a 500 response if any errors are thrown', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const error = new Error('Failed to connect to DB');
    jest.mocked(generateReconciliationSummaries).mockRejectedValue(error);

    // Act
    await getUtilisationReportsReconciliationSummary(req, res);

    // Assert
    const expectedErrorMessage = 'Failed to get utilisation reports reconciliation summary';

    expect(console.error).toHaveBeenCalledWith(expectedErrorMessage, error);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual(expectedErrorMessage);
  });

  it('returns the reconciliation summary', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    jest.mocked(generateReconciliationSummaries).mockResolvedValue([MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY]);

    // Act
    await getUtilisationReportsReconciliationSummary(req, res);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res._getData()).toEqual([MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY]);
  });
});
