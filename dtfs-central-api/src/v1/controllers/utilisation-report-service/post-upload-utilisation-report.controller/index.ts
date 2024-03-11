import { Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { AzureFileInfo, Unknown } from '@ukef/dtfs2-common';
import {
  validateReportId,
  validateUtilisationReportData,
  validateFileInfo,
  validateReportUser,
} from '../../../validation/utilisation-report-service/utilisation-report-validator';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { UtilisationReportRawCsvData } from '../../../../types/utilisation-reports';
import { ApiError } from '../../../../errors';

export type PostUploadUtilisationReportRequestBody = {
  reportId: number;
  fileInfo: AzureFileInfo;
  reportData: UtilisationReportRawCsvData[];
  user: { _id: string };
};

type PreValidationPostUploadUtilisationReportRequest = CustomExpressRequest<{
  reqBody: Unknown<PostUploadUtilisationReportRequestBody>;
}>;

export const postUploadUtilisationReportPayloadValidator = (req: PreValidationPostUploadUtilisationReportRequest, res: Response, next: NextFunction) => {
  const { reportId, fileInfo, reportData, user } = req.body;

  const validationErrors = [
    validateReportId(reportId),
    ...validateFileInfo(fileInfo),
    ...validateUtilisationReportData(reportData),
    ...validateReportUser(user),
  ].filter(Boolean);

  if (validationErrors.length > 0) {
    console.error('Failed to save utilisation report - validation errors: %O', validationErrors);
    return res.status(HttpStatusCode.BadRequest).send(validationErrors);
  }

  return next();
};

type PostUploadUtilisationReportRequest = CustomExpressRequest<{
  reqBody: PostUploadUtilisationReportRequestBody;
}>;

export const postUploadUtilisationReport = async (req: PostUploadUtilisationReportRequest, res: Response) => {
  try {
    const { reportId, reportData, user, fileInfo } = req.body;
    const uploadedByUserId = user._id.toString();

    const reportStateMachine = await UtilisationReportStateMachine.forReportId(reportId);

    const updatedReport = await reportStateMachine.handleEvent({
      type: 'REPORT_UPLOADED',
      payload: {
        azureFileInfo: fileInfo,
        reportCsvData: reportData,
        uploadedByUserId,
        requestSource: {
          platform: 'PORTAL',
          userId: uploadedByUserId,
        },
      },
    });

    return res.status(HttpStatusCode.Created).send({ dateUploaded: updatedReport.dateUploaded });
  } catch (error) {
    console.error('Error saving utilisation report:', error);

    if (error instanceof ApiError) {
      return res.status(error.status).send(`Failed to save utilisation report: ${error.message}`);
    }

    return res.status(HttpStatusCode.InternalServerError).send('Failed to save utilisation report');
  }
};
