import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../../api';

/**
 * Request type for the GET fee record correction transient form data endpoint.
 */
export type GetFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    correctionId: string;
  };
}>;

/**
 * Controller for the GET fee record correction transient form data route.
 * @param req - The request object
 * @param res - The response object
 * @returns The fee record correction transient form data if exists, otherwise an empty object.
 */
export const getFeeRecordCorrectionTransientFormData = async (req: GetFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { correctionId } = req.params;

    const formData = await api.getFeeRecordCorrectionTransientFormData(Number(correctionId), req.user._id);

    return res.status(HttpStatusCode.Ok).send(formData);
  } catch (error) {
    const errorMessage = 'Failed to get fee record correction transient form data';

    console.error('%s %o', errorMessage, error);

    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    return res.status(errorStatus).send(errorMessage);
  }
};
