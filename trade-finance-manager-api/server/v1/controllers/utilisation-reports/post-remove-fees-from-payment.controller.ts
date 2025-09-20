import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

export type PostRemoveFeesFromPaymentRequestBody = {
  selectedFeeRecordIds: number[];
  user: TfmSessionUser;
};

export type PostRemoveFeesFromPaymentRequestParams = {
  reportId: string;
  paymentId: string;
};

export type PostRemoveFeesFromPaymentRequest = CustomExpressRequest<{
  reqBody: PostRemoveFeesFromPaymentRequestBody;
  params: PostRemoveFeesFromPaymentRequestParams;
}>;

/**
 * Removes the supplied fee records from a supplied payment
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const postRemoveFeesFromPayment = async (req: PostRemoveFeesFromPaymentRequest, res: Response) => {
  try {
    const { reportId, paymentId } = req.params;
    const { selectedFeeRecordIds, user } = req.body;

    await api.removeFeesFromPayment(reportId, paymentId, selectedFeeRecordIds, user);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to remove fees from payment group';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
