import { Response } from 'express';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { getUtilisationReportDetailsByBankId, getUtilisationReportDetailsByBankIdMonthAndYear } from '../../../services/repositories/utilisation-reports-repo';

type GetUtilisationReportsRequest = CustomExpressRequest<{
  params: {
    bankId: string;
  };
  query: {
    month: string | undefined;
    year: string | undefined;
  };
}>;

/**
 * Gets utilisation reports from the database. Filters by bank ID and report start month & year.
 * @param req 
 * @param res 
 */

export const getUtilisationReports = async (req: GetUtilisationReportsRequest, res: Response) => {
  try {
    const { bankId } = req.params;
    const { month, year } = req.query;

    if (month && year) {
      const utilisationReport = await getUtilisationReportDetailsByBankIdMonthAndYear(bankId, Number(month), Number(year));
      const utilisationReports = utilisationReport ? [utilisationReport] : [];
      return res.status(200).send(utilisationReports);
    }

    const utilisationReports = await getUtilisationReportDetailsByBankId(bankId);
    return res.status(200).send(utilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports:', error);
    return res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};
