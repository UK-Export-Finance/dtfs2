import { UtilisationReportPremiumPaymentsTabFilters } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { AxiosError, HttpStatusCode } from 'axios';
import api from '../../../api';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';

export type GetUtilisationReportReconciliationDetailsByIdRequest = CustomExpressRequest<{
  params: {
    reportId: string;
  };
  query: {
    premiumPaymentsTabFilters?: UtilisationReportPremiumPaymentsTabFilters;
  };
}>;

type ResponseBody = UtilisationReportReconciliationDetailsResponseBody | string;

export const getUtilisationReportReconciliationDetailsById = async (req: GetUtilisationReportReconciliationDetailsByIdRequest, res: Response<ResponseBody>) => {
  const { reportId } = req.params;

  try {
    const { premiumPaymentsTabFilters } = req.query;
    const utilisationReportReconciliationDetails = await api.getUtilisationReportReconciliationDetailsById(reportId, premiumPaymentsTabFilters);

    return res.status(HttpStatusCode.Ok).send(utilisationReportReconciliationDetails);
  } catch (error) {
    console.error('Failed to get utilisation report reconciliation details by id', error);
    if (error instanceof AxiosError) {
      return res
        .status(error.response?.status ?? HttpStatusCode.InternalServerError)
        .send(`Failed to get utilisation report reconciliation details for report with id '${reportId}': ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(`Failed to get utilisation report reconciliation details for report with id '${reportId}'`);
  }
};
