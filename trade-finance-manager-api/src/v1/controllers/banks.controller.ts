import { HttpStatusCode, isAxiosError } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';
import api from '../api';

export const findOneBank = async (id: unknown) => {
  if (typeof id !== 'string') {
    throw new Error('Invalid Bank Id');
  }

  const banksCollection = await mongoDbClient.getCollection('banks');
  const bank = await banksCollection.findOne({ id: { $eq: id } });
  return bank;
};

type GetAllBanksRequest = CustomExpressRequest<{
  query: {
    includeReportingYears?: 'true' | 'false';
  };
}>;

/**
 * Fetches all banks
 */
export const getAllBanks = async (req: GetAllBanksRequest, res: Response) => {
  const { includeReportingYears } = req.query;

  try {
    if (includeReportingYears !== 'true') {
      const banks = await api.getAllBanks();
      return res.status(HttpStatusCode.Ok).send(banks);
    }

    const banksWithReportingYears = await api.getAllBanksWithReportingYears();
    return res.status(HttpStatusCode.Ok).send(banksWithReportingYears);
  } catch (error) {
    const errorMessage = 'Failed to get banks';
    console.error(errorMessage, error);
    const errorStatus: number = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(errorStatus).send(errorMessage);
  }
};
