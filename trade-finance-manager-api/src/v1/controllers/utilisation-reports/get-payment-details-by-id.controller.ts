import { Request, Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { PaymentDetailsResponseBody } from '../../api-response-types';
import api from '../../api';

type GetPaymentDetailsByIdResponse = Response<PaymentDetailsResponseBody | string>;

export const getPaymentDetailsById = async (req: Request, res: GetPaymentDetailsByIdResponse) => {
  const { reportId, paymentId } = req.params;

  try {
    const paymentDetails = await api.getPaymentDetails(reportId, paymentId);

    return res.status(HttpStatusCode.Ok).send(paymentDetails);
  } catch (error) {
    const errorMessage = 'Failed to get payment details';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
