import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, Currency, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

export type PostPaymentRequestBody = {
  feeRecordIds: number[];
  paymentCurrency: Currency;
  paymentAmount: number;
  datePaymentReceived: string;
  paymentReference?: string;
  user: TfmSessionUser;
};

export type PostPaymentRequestParams = {
  reportId: string;
};

export type PostPaymentRequest = CustomExpressRequest<{
  reqBody: PostPaymentRequestBody;
  params: PostPaymentRequestParams;
}>;

/**
 * Adds a payment to the supplied fee records
 * @param {import('express').Request<{ reportId: string }>} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const postPayment = async (req: PostPaymentRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { feeRecordIds, paymentCurrency, paymentAmount, datePaymentReceived, paymentReference, user } = req.body;

    const data = await api.addPaymentToFeeRecords(reportId, feeRecordIds, user, paymentCurrency, paymentAmount, datePaymentReceived, paymentReference);
    return res.status(HttpStatusCode.Ok).send(data);
  } catch (error) {
    const errorMessage = 'Failed to add payment';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
