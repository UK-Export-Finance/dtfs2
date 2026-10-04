import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode, isAxiosError } from 'axios';
import { FeeRecordResponseBody } from '../../api-response-types';
import api from '../../api';

export type GetFeeRecordRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

type GetFeeRecordResponse = Response<FeeRecordResponseBody | string>;

/**
 * Fetches the fee record
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getFeeRecord = async (req: GetFeeRecordRequest, res: GetFeeRecordResponse) => {
  const { reportId, feeRecordId } = req.params;

  try {
    const feeRecord = await api.getFeeRecord(reportId, feeRecordId);

    return res.status(HttpStatusCode.Ok).send(feeRecord);
  } catch (error) {
    const errorMessage = 'Failed to get fee record';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error('%s %o', errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
