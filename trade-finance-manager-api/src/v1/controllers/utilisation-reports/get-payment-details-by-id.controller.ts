import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { PaymentDetailsResponseBody } from '../../api-response-types';
import api from '../../api';

type GetPaymentDetailsByIdRequest = CustomExpressRequest<{
  query: {
    includeFeeRecords?: 'true' | 'false';
  };
}>;

type GetPaymentDetailsByIdResponse = Response<PaymentDetailsResponseBody | string>;

export const getPaymentDetailsById = async (req: GetPaymentDetailsByIdRequest, res: GetPaymentDetailsByIdResponse) => {
  const { reportId, paymentId } = req.params;
  const { includeFeeRecords } = req.query;

  try {
    const includeFeeRecordsQuery = includeFeeRecords === 'true';
    const paymentDetails = await api.getPaymentDetails(reportId, paymentId, includeFeeRecordsQuery);

    return res.status(HttpStatusCode.Ok).send(paymentDetails);
  } catch (error) {
    const errorMessage = 'Failed to get payment details';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
