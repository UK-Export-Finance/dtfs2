import { CustomExpressRequest, PaymentDetailsFilters, PremiumPaymentsFilters } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { AxiosError, HttpStatusCode } from 'axios';
import api from '../../../api';
import { UtilisationReportReconciliationDetailsResponseBody } from '../../../api-response-types';

export type GetUtilisationReportReconciliationDetailsByIdRequest = CustomExpressRequest<{
  params: {
    reportId: string;
  };
  query: {
    premiumPaymentsFilters?: PremiumPaymentsFilters;
    paymentDetailsFilters?: PaymentDetailsFilters;
  };
}>;

type ResponseBody = UtilisationReportReconciliationDetailsResponseBody | string;

export const getUtilisationReportReconciliationDetailsById = async (req: GetUtilisationReportReconciliationDetailsByIdRequest, res: Response<ResponseBody>) => {
  const { reportId } = req.params;

  try {
    const { premiumPaymentsFilters, paymentDetailsFilters } = req.query;
    const utilisationReportReconciliationDetails = await api.getUtilisationReportReconciliationDetailsById(
      reportId,
      premiumPaymentsFilters,
      paymentDetailsFilters,
    );

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
