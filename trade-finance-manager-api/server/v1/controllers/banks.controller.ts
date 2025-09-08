import { HttpStatusCode, isAxiosError } from 'axios';
import { Response } from 'express';
import { ApiErrorResponseBody, CustomExpressRequest } from '@ukef/dtfs2-common';
import api from '../api';
import { BankResponseBody, BankWithReportingYearsResponseBody } from '../api-response-types';

type GetBanksRequest = CustomExpressRequest<{
  query: {
    includeReportingYears?: 'true' | 'false';
  };
}>;

type GetBanksResponseBody = BankResponseBody[] | BankWithReportingYearsResponseBody[] | ApiErrorResponseBody;

/**
 * Fetches all banks
 * @param req - The request object
 * @param res - The response object
 */
export const getBanks = async (req: GetBanksRequest, res: Response<GetBanksResponseBody>) => {
  const { includeReportingYears } = req.query;

  try {
    const banksResponse = await api.getBanks({
      includeReportingYears: includeReportingYears === 'true',
    });
    return res.status(HttpStatusCode.Ok).send(banksResponse);
  } catch (error) {
    const errorMessage = 'Failed to get banks';
    console.error(errorMessage, error);
    const errorStatus: number = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(errorStatus).send({
      message: errorMessage,
      status: errorStatus,
    });
  }
};
