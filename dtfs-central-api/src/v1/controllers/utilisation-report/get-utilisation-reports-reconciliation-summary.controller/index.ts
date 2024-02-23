import { Request, Response } from 'express';
import { IsoMonthStamp } from '../../../../types/date';
import { UtilisationReportReconciliationSummary } from '../../../../types/utilisation-reports';
import { generateReconciliationSummaries } from './helpers';

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
