import { UtilisationReportPremiumPaymentsTabFilters } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { NotFoundError, ApiError } from '../../../../errors';
import { getUtilisationReportReconciliationDetails } from './helpers';
import { REGEX } from '../../../../constants';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

export type GetUtilisationReportReconciliationDetailsByIdRequest = CustomExpressRequest<{
  params: {
    reportId: string;
  };
  query: {
    premiumPaymentsTabFilters?: UtilisationReportPremiumPaymentsTabFilters;
  };
}>;

type ResponseBody = UtilisationReportReconciliationDetails | string;

export const getUtilisationReportReconciliationDetailsById = async (req: GetUtilisationReportReconciliationDetailsByIdRequest, res: Response<ResponseBody>) => {
  const { reportId } = req.params;
  const { premiumPaymentsTabFilters } = req.query;

  const facilityId = premiumPaymentsTabFilters?.facilityId;

  try {
    // TODO FN-2311: Can we pull out this filter extraction into its own helper method? Provide it with the full filters object for the PP tab, returns an object of the extracted/parsed filters.
    const facilityIdFilter = facilityId && REGEX.UKEF_PARTIAL_FACILITY_ID_REGEX.test(facilityId) ? facilityId : undefined;

    const utilisationReport = await UtilisationReportRepo.findOneByIdWithFeeRecordsWithPayments(Number(reportId));
    if (!utilisationReport) {
      throw new NotFoundError(`Failed to find a report with id '${reportId}'`);
    }

    const utilisationReportReconciliationDetails = await getUtilisationReportReconciliationDetails(utilisationReport, facilityIdFilter);

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
