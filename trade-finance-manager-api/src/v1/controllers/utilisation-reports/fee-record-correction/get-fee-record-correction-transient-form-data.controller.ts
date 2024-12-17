import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';
import api from '../../../api';
import { CustomExpressRequest } from '../../../../types/custom-express-request';

export type GetFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    user: string;
  };
}>;

/**
 * Gets the users fee record correction transient form data for the given fee record id
 * @param req - The request object
 * @param res - The response object
 */
export const getFeeRecordCorrectionTransientFormData = async (req: GetFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { reportId, feeRecordId, user } = req.params;

    const transientFormData = await api.getFeeRecordCorrectionTransientFormData(reportId, feeRecordId, user);

    return res.status(HttpStatusCode.Ok).send(transientFormData);
  } catch (error) {
    const errorMessage = 'Failed to get fee record correction transient form data';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
