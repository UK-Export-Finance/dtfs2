import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';
import { RecordCorrectionRequestTransientFormData } from '@ukef/dtfs2-common';
import api from '../../../api';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { TfmSessionUser } from '../../../../types/tfm-session-user';

export type PutFeeRecordCorrectionTransientFormDataRequestBody = {
  formData: RecordCorrectionRequestTransientFormData;
  user: TfmSessionUser;
};

export type PutFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
  reqBody: PutFeeRecordCorrectionTransientFormDataRequestBody;
}>;

/**
 * Updates the users fee record correction transient form data
 * @param req - The request object
 * @param res - The response object
 */
export const putFeeRecordCorrectionTransientFormData = async (req: PutFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { formData, user } = req.body;

    await api.updateFeeRecordCorrectionTransientFormData(reportId, feeRecordId, formData, user);

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to put fee record correction transient form data';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
