import { CustomExpressRequest, RecordCorrectionFormValues } from '@ukef/dtfs2-common';
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

/**
 * Request type for the PUT fee record correction transient form data endpoint.
 */
export type PutFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    correctionId: string;
  };
  reqBody: RecordCorrectionFormValues;
}>;

/**
 * Controller for the PUT fee record correction transient form data route.
 * @param req - The request object
 * @param res - The response object
 */
export const putFeeRecordCorrectionTransientFormData = async (req: PutFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { bankId, correctionId } = req.params;
    const formData = req.body;
    const userId = req.user._id;

    const response = await api.putFeeRecordCorrectionTransientFormData(bankId, Number(correctionId), userId, formData);

    return res.status(HttpStatusCode.Ok).send(response);
  } catch (error) {
    const errorMessage = 'Failed to put fee record correction transient form data';

    console.error('%s %o', errorMessage, error);

    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    return res.status(errorStatus).send(errorMessage);
  }
};

/**
 * Request type for the DELETE fee record correction transient form data endpoint.
 */
export type DeleteFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    correctionId: string;
  };
}>;

/**
 * Controller for the DELETE fee record correction transient form data route.
 * @param req - The request object
 * @param res - The response object
 * @returns A '{@link HttpStatusCode.NoContent}' if there are no errors, else
 * an error status code. If an Axios error occurs, the specific status code
 * from the error response is returned, otherwise returns a
 * {@link HttpStatusCode.InternalServerError}.
 */
export const deleteFeeRecordCorrectionTransientFormData = async (req: GetFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { correctionId } = req.params;

    await api.deleteFeeRecordCorrectionTransientFormData(Number(correctionId), req.user._id);

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    const errorMessage = 'Failed to delete fee record correction transient form data';

    console.error('%s %o', errorMessage, error);

    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    return res.status(errorStatus).send(errorMessage);
  }
};
