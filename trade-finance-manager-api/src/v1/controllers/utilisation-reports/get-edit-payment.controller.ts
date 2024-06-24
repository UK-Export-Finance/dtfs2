import { Request, Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { EditPaymentDetailsResponseBody } from '../../api-response-types';
import api from '../../api';

type GetEditPaymentDetailsResponse = Response<EditPaymentDetailsResponseBody | string>;

export const getEditPayment = async (req: Request, res: GetEditPaymentDetailsResponse) => {
  const { reportId, paymentId } = req.params;

  try {
    const editPaymentDetails = await api.getEditPaymentDetails(reportId, paymentId);

    return res.status(HttpStatusCode.Ok).send(editPaymentDetails);
  } catch (error) {
    const errorMessage = 'Failed to get edit payment details';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
