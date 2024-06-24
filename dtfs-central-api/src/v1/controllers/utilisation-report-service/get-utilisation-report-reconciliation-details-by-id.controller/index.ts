import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { FindOptionsWhere, Like } from 'typeorm';
import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { NotFoundError, ApiError } from '../../../../errors';
import { mapUtilisationReportEntityToReconciliationDetails } from './helpers';
import { REGEX } from '../../../../constants';

export type GetUtilisationReportReconciliationDetailsByIdRequest = CustomExpressRequest<{
  params: {
    reportId: string;
  };
  query: {
    facilityIdQuery?: string;
  };
}>;

type ResponseBody = UtilisationReportReconciliationDetails | string;

export const getUtilisationReportReconciliationDetailsById = async (req: GetUtilisationReportReconciliationDetailsByIdRequest, res: Response<ResponseBody>) => {
  const { reportId } = req.params;
  const { facilityIdQuery } = req.query;

  try {
    const feeRecordFindOptions: FindOptionsWhere<UtilisationReportEntity> =
      facilityIdQuery && REGEX.UKEF_PARTIAL_FACILITY_ID_REGEX.test(facilityIdQuery)
        ? {
            feeRecords: {
              facilityId: Like(`%${facilityIdQuery}%`),
            },
          }
        : {};

    const utilisationReport = await UtilisationReportRepo.findOne({
      where: { id: Number(reportId), ...feeRecordFindOptions },
      relations: {
        feeRecords: {
          payments: {
            feeRecords: true,
          },
        },
      },
    });

    if (!utilisationReport) {
      const errorMessage = facilityIdQuery
        ? `Failed to find a report with id '${reportId}' & facility id containing '${facilityIdQuery}'`
        : `Failed to find a report with id '${reportId}'`;
      throw new NotFoundError(errorMessage);
    }

    const utilisationReportReconciliationDetails = await mapUtilisationReportEntityToReconciliationDetails(utilisationReport);

    return res.status(HttpStatusCode.Ok).send(utilisationReportReconciliationDetails);
  } catch (error) {
    const errorMessage = facilityIdQuery
      ? `Failed to get utilisation report reconciliation for report with id '${reportId}' & facility id containing '${facilityIdQuery}'`
      : `Failed to get utilisation report reconciliation for report with id '${reportId}'`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
