import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

export type PostFeesToAnExistingPaymentRequestBody = {
  feeRecordIds: number[];
  paymentIds: number[];
  user: TfmSessionUser;
};

export type PostFeesToAnExistingPaymentRequestParams = {
  reportId: string;
};

export type PostFeesToAnExistingPaymentRequest = CustomExpressRequest<{
  reqBody: PostFeesToAnExistingPaymentRequestBody;
  params: PostFeesToAnExistingPaymentRequestParams;
}>;

export const postFeesToAnExistingPayment = async (req: PostFeesToAnExistingPaymentRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { feeRecordIds, paymentIds, user } = req.body;

    await api.addFeesToAnExistingPayment(reportId, feeRecordIds, paymentIds, user);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to add fees to an existing payment';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
