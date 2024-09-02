import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { AzureFileInfo, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { UtilisationReportRawCsvData } from '../../../../types/utilisation-reports';
import { ApiError } from '../../../../errors';
import { executeWithSqlTransaction } from '../../../../helpers';

export type PostUploadUtilisationReportRequestBody = {
  reportId: number;
  fileInfo: AzureFileInfo;
  reportData: UtilisationReportRawCsvData[];
  user: { _id: string };
};

type PostUploadUtilisationReportRequest = CustomExpressRequest<{
  reqBody: PostUploadUtilisationReportRequestBody;
}>;

/**
 * Uploads the report for the utilisation report in a transaction using the state machine
 * @param reportId - The id of the utilisation report
 * @param reportData - The array representing the report data
 * @param user - The user object with just the _id
 * @param fileInfo - The file info object
 */
export const uploadReportInTransaction = async (
  reportId: number,
  reportData: UtilisationReportRawCsvData[],
  user: { _id: string },
  fileInfo: AzureFileInfo,
): Promise<UtilisationReportEntity> => {
  const uploadedByUserId = user._id.toString();

  const reportStateMachine = await UtilisationReportStateMachine.forReportId(reportId);
  const updatedReport = await executeWithSqlTransaction(async (transactionEntityManager) => {
    return await reportStateMachine.handleEvent({
      type: 'REPORT_UPLOADED',
      payload: {
        azureFileInfo: fileInfo,
        reportCsvData: reportData,
        uploadedByUserId,
        requestSource: {
          platform: 'PORTAL',
          userId: uploadedByUserId,
        },
        transactionEntityManager,
      },
    });
  });
  return updatedReport;
};

/**
 * Controller for the utilisation report upload
 * @param req - The request object
 * @param res - The response object
 */
export const postUploadUtilisationReport = async (req: PostUploadUtilisationReportRequest, res: Response) => {
  try {
    const { reportId, reportData, user, fileInfo } = req.body;

    const updatedReport = await uploadReportInTransaction(reportId, reportData, user, fileInfo);

    return res.status(HttpStatusCode.Created).send({ dateUploaded: updatedReport.dateUploaded });
  } catch (error) {
    console.error('Error saving utilisation report:', error);

    if (error instanceof ApiError) {
      return res.status(error.status).send(`Failed to save utilisation report: ${error.message}`);
    }

    return res.status(HttpStatusCode.InternalServerError).send('Failed to save utilisation report');
  }
};
