const httpMocks = require('node-mocks-http');
const api = require('../../api');
const { getUtilisationReportsReconciliationSummary } = require('.');

jest.mock('../../api');
console.error = jest.fn();

describe('getUtilisationReportsReconciliationSummary', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns 200 response when the request succeeds', async () => {
    // Arrange
    const mockSummary = [{ reportId: 1 }];
    api.getUtilisationReportsReconciliationSummary = jest.fn().mockResolvedValue(mockSummary);

    const { req, res } = httpMocks.createMocks({
      params: { submissionMonth: '2023-11' },
    });

    // Act
    await getUtilisationReportsReconciliationSummary(req, res);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res._getData()).toEqual(mockSummary);
  });

  it('returns the AxiosError status code when thrown', async () => {
    // Arrange
    const axiosErrorStatus = 401;
    api.getUtilisationReportsReconciliationSummary = jest.fn().mockRejectedValue({
      response: { status: axiosErrorStatus },
    });

    const { req, res } = httpMocks.createMocks({
      params: { submissionMonth: '2023-11' },
    });

    // Act
    await getUtilisationReportsReconciliationSummary(req, res);

    // Assert
    expect(res.statusCode).toEqual(401);
    expect(res._getData()).toEqual('Failed to get utilisation reports reconciliation summary');
  });

  it('returns a 500 error response when a non-AxiosError is thrown', async () => {
    // Arrange
    api.getUtilisationReportsReconciliationSummary = jest.fn().mockRejectedValue(new Error('Failed to authenticate'));

    const { req, res } = httpMocks.createMocks({
      params: { submissionMonth: '2023-11' },
    });

    // Act
    await getUtilisationReportsReconciliationSummary(req, res);

    // Assert
    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('Failed to get utilisation reports reconciliation summary');
  });
});
