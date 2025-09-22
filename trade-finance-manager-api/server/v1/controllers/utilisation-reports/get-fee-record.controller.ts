import { Request, Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { FeeRecordResponseBody } from '../../api-response-types';
import api from '../../api';

type GetFeeRecordResponse = Response<FeeRecordResponseBody | string>;

/**
 * Fetches the fee record
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getFeeRecord = async (req: Request, res: GetFeeRecordResponse) => {
  const { reportId, feeRecordId } = req.params;

  try {
    const feeRecord = await api.getFeeRecord(reportId, feeRecordId);

    return res.status(HttpStatusCode.Ok).send(feeRecord);
  } catch (error) {
    const errorMessage = 'Failed to get fee record';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
