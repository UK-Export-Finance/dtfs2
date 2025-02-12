import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { CustomExpressRequest, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

type DeletePaymentRequest = CustomExpressRequest<{
  reqBody: {
    user: TfmSessionUser;
  };
}>;

export const deletePayment = async (req: DeletePaymentRequest, res: Response) => {
  const { reportId, paymentId } = req.params;
  const { user } = req.body;

  try {
    await api.deletePaymentById(reportId, paymentId, user);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to delete payment';
    console.error(errorMessage, error);
    const statusCode = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(statusCode).send(errorMessage);
  }
};
