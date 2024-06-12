import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';
import { Currency } from '@ukef/dtfs2-common';
import api from '../../api';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { TfmSessionUser } from '../../../types/tfm-session-user';

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

export const postPayment = async (req: PostPaymentRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { feeRecordIds, paymentCurrency, paymentAmount, datePaymentReceived, paymentReference, user } = req.body;

    await api.addPaymentToFeeRecords(reportId, feeRecordIds, user, paymentCurrency, paymentAmount, datePaymentReceived, paymentReference);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to add payment';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
