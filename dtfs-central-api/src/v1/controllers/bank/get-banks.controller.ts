import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { CustomExpressRequest, Bank, ApiError, ApiErrorResponseBody } from '@ukef/dtfs2-common';
import { getAllBanks } from '../../../repositories/banks-repo';
import { UtilisationReportRepo } from '../../../repositories/utilisation-reports-repo';

type GetBanksRequest = CustomExpressRequest<{
  query: {
    includeReportingYears?: 'true' | 'false';
  };
}>;

type BankWithReportingYears = Bank & {
  reportingYears: number[];
};

type GetBanksResponseBody = Bank[] | BankWithReportingYears[] | ApiErrorResponseBody;

const mapBankToBankWithReportingYears = async (bank: Bank): Promise<BankWithReportingYears> => {
  const { id: bankId, isVisibleInTfmUtilisationReports } = bank;
  if (!isVisibleInTfmUtilisationReports) {
    return { ...bank, reportingYears: [] };
  }

  const reportingYearsForBankId = await UtilisationReportRepo.findReportingYearsByBankId(bankId);
  return { ...bank, reportingYears: Array.from(reportingYearsForBankId) };
};

export const getBanks = async (req: GetBanksRequest, res: Response<GetBanksResponseBody>) => {
  const { includeReportingYears } = req.query;

  try {
    const banks = await getAllBanks();
    if (includeReportingYears !== 'true') {
      return res.status(HttpStatusCode.Ok).send(banks);
    }

    const banksWithReportingYears = await Promise.all(banks.map(mapBankToBankWithReportingYears));
    return res.status(HttpStatusCode.Ok).send(banksWithReportingYears);
  } catch (error) {
    const errorMessage = 'Failed to get all banks';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: `${errorMessage}: ${error.message}`,
        code: error.code,
      });
    }
    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: errorMessage,
    });
  }
};
