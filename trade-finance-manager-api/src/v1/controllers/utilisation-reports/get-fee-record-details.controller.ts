import { Request, Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { FeeRecordDetailsResponseBody } from '../../api-response-types';
import api from '../../api';

type GetFeeRecordDetailsResponse = Response<FeeRecordDetailsResponseBody | string>;

export const getFeeRecordDetails = async (req: Request, res: GetFeeRecordDetailsResponse) => {
  const { reportId, feeRecordId } = req.params;

  try {
    const feeRecordDetails = await api.getFeeRecordDetails(reportId, feeRecordId);

    return res.status(HttpStatusCode.Ok).send(feeRecordDetails);
  } catch (error) {
    const errorMessage = 'Failed to get fee record details';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
