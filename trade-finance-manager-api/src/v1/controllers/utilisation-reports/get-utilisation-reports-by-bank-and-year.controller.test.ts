import { Request } from 'express';
import httpMocks from 'node-mocks-http';
import { AxiosError, AxiosResponse } from 'axios';
import { getUtilisationReportSummariesByBankAndYear } from '.';
import api from '../../api';

jest.mock('../../api');
console.error = jest.fn();

describe('getUtilisationReportSummariesByBankAndYear', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns 200 response when the request succeeds', async () => {
    // Arrange
    const mockSummary = [{ reportId: 1 }];
    api.getUtilisationReportSummariesByBankIdAndYear = jest.fn().mockResolvedValue(mockSummary);

    const { req, res } = httpMocks.createMocks<Request<{ bankId: string; year: string }>>({
      params: { bankId: '123', year: '2023' },
    });

    // Act
    await getUtilisationReportSummariesByBankAndYear(req, res);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res._getData()).toEqual(mockSummary);
  });

  it('returns the AxiosError status code when thrown', async () => {
    // Arrange
    const bankId = '123';
    const year = '2023';

    const axiosErrorStatus = 401;
    const axiosError = new AxiosError();
    axiosError.response = { status: axiosErrorStatus } as AxiosResponse;
    api.getUtilisationReportSummariesByBankIdAndYear = jest.fn().mockRejectedValueOnce(axiosError);

    const { req, res } = httpMocks.createMocks<Request<{ bankId: string; year: string }>>({
      params: { bankId, year },
    });

    // Act
    await getUtilisationReportSummariesByBankAndYear(req, res);

    // Assert
    expect(res.statusCode).toEqual(401);
    expect(res._getData()).toEqual(`Failed to get previous utilisation reports by bank id ${bankId} and year ${year}`);
  });

  it('returns a 500 error response when a non-AxiosError is thrown', async () => {
    // Arrange
    const bankId = '123';
    const year = '2023';
    api.getUtilisationReportSummariesByBankIdAndYear = jest.fn().mockRejectedValue(new Error('Failed to authenticate'));

    const { req, res } = httpMocks.createMocks<Request<{ bankId: string; year: string }>>({
      params: { bankId, year },
    });

    // Act
    await getUtilisationReportSummariesByBankAndYear(req, res);

    // Assert
    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual(`Failed to get previous utilisation reports by bank id ${bankId} and year ${year}`);
  });
});
