import { Request, Response } from 'express';
import { IsoMonthStamp, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummary } from '../../../../types/utilisation-reports';
import { generateReconciliationSummaries, mapReportToSummaryItem } from './helpers';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { getBankById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

export const getUtilisationReportsReconciliationSummary = async (
  req: Request<{ submissionMonth: IsoMonthStamp }>,
  res: Response<UtilisationReportReconciliationSummary[] | string>,
) => {
  try {
    const { submissionMonth } = req.params;

    const reconciliationSummary = await generateReconciliationSummaries(submissionMonth);

    res.status(200).send(reconciliationSummary);
  } catch (error) {
    const errorMessage = 'Failed to get utilisation reports reconciliation summary';
    console.error(errorMessage, error);
    res.status(500).send(errorMessage);
  }
};

export type GetUtilisationReportsByBankIdAndYearRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    year: string;
  };
}>;

/**
 * Gets utilisation reports from the database filtered by
 * bank id, year and status
 * @param req - The request object
 * @param res - The response object
 */
export const getUtilisationReportSummariesByBankIdAndYear = async (req: GetUtilisationReportsByBankIdAndYearRequest, res: Response) => {
  try {
    const { bankId, year } = req.params;

    const bank = await getBankById(bankId);
    if (!bank) {
      throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
    }

    const utilisationReports: UtilisationReportEntity[] = await UtilisationReportRepo.findSubmittedReportsForBankIdWithReportPeriodEndInYear(
      bankId,
      Number(year),
    );

    const mappedUtilisationReports = utilisationReports.map((utilisationReport) => mapReportToSummaryItem(bank, utilisationReport));

    const utilisationReportsSummary = {
      bankName: bank.name,
      year,
      reports: mappedUtilisationReports,
    };
    return res.status(200).send(utilisationReportsSummary);
  } catch (error) {
    console.error('Unable to get utilisation report summaries:', error);
    return res.status(500).send({ status: 500, message: 'Failed to get utilisation report summaries' });
  }
};
