import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { IsoDateTimeStamp, CustomExpressRequest, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

export type PatchPaymentRequest = CustomExpressRequest<{
  reqBody: {
    paymentAmount: number;
    datePaymentReceived: IsoDateTimeStamp;
    paymentReference: string | null;
    user: TfmSessionUser;
  };
}>;

/**
 * Updates the payment with the supplied edit payment form values
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const patchPayment = async (req: PatchPaymentRequest, res: Response) => {
  const { reportId, paymentId } = req.params;
  const { paymentAmount, datePaymentReceived, paymentReference, user } = req.body;

  try {
    await api.editPayment(reportId, paymentId, paymentAmount, datePaymentReceived, paymentReference, user);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to edit payment';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
