import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { NotFoundError, ApiError } from '../../../../errors';
import { mapUtilisationReportEntityToReconciliationDetails } from './helpers';

export type GetUtilisationReportReconciliationDetailsByIdRequest = CustomExpressRequest<{
  params: {
    reportId: string;
  };
}>;

type ResponseBody = UtilisationReportReconciliationDetails | string;

export const getUtilisationReportReconciliationDetailsById = async (req: GetUtilisationReportReconciliationDetailsByIdRequest, res: Response<ResponseBody>) => {
  const { reportId } = req.params;

  try {
    const utilisationReport = await UtilisationReportRepo.findOne({
      where: { id: Number(reportId) },
      relations: {
        feeRecords: {
          payments: true,
        },
      },
    });
    if (!utilisationReport) {
      throw new NotFoundError(`Failed to find a report with id '${reportId}'`);
    }

    const utilisationReportReconciliationDetails = await mapUtilisationReportEntityToReconciliationDetails(utilisationReport);

    return res.status(HttpStatusCode.Ok).send(utilisationReportReconciliationDetails);
  } catch (error) {
    const errorMessage = `Failed to get utilisation report reconciliation for report with id '${reportId}'`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
