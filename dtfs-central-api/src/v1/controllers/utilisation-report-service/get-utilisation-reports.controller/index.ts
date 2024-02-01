import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { getManyUtilisationReportDetailsByBankId } from '../../../../services/repositories/utilisation-reports-repo';
import { UtilisationReportReconciliationStatus } from '../../../../types/utilisation-reports';
import { parseReportPeriod } from './helpers';

export type GetUtilisationReportsRequest = CustomExpressRequest<{
  params: {
    bankId: string;
  };
  query: {
    reportPeriod: string | undefined;
    reportStatuses: UtilisationReportReconciliationStatus[] | undefined;
  };
}>;

/**
 * Gets utilisation reports from the database. Filters by bank ID and report start month & year.
 * @param req - The request object
 * @param res - The response object
 */
export const getUtilisationReports = async (req: GetUtilisationReportsRequest, res: Response) => {
  try {
    const { bankId } = req.params;
    const { reportPeriod, reportStatuses } = req.query;

    const parsedReportPeriod = parseReportPeriod(reportPeriod);

    const utilisationReports = await getManyUtilisationReportDetailsByBankId(bankId, {
      reportPeriod: parsedReportPeriod,
      reportStatuses,
    });
    return res.status(200).send(utilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports:', error);
    return res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};
