import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';
import api from '../../../api';
import { CustomExpressRequest } from '../../../../types/custom-express-request';

export type DeleteFeeRecordCorrectionTransientFormDataRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
    user: string;
  };
}>;

/**
 * Deletes the users fee record correction transient form data for the given
 * fee record id.
 * @param req - The request object
 * @param res - The response object
 * @returns A '{@link HttpStatusCode.NoContent}' if there are no errors, else
 * an error status code. If an Axios error occurs, the specific status code
 * from the error response is returned, otherwise returns a
 * {@link HttpStatusCode.InternalServerError}.
 */
export const deleteFeeRecordCorrectionTransientFormData = async (req: DeleteFeeRecordCorrectionTransientFormDataRequest, res: Response) => {
  try {
    const { reportId, feeRecordId, user } = req.params;

    await api.deleteFeeRecordCorrectionTransientFormData(reportId, feeRecordId, user);

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    const errorMessage = 'Failed to delete fee record correction transient form data';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
