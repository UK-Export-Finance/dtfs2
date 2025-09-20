import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../api';

export type GetSelectedFeeRecordsDetailsRequest = CustomExpressRequest<{
  params: {
    id: string;
  };
  query: {
    includeAvailablePaymentGroups?: 'true' | 'false';
  };
  reqBody: {
    feeRecordIds: number[];
  };
}>;

/**
 * Fetches selected fee records details
 * @param {import('express').Request<{ id: string }>} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const getSelectedFeeRecordsDetails = async (req: GetSelectedFeeRecordsDetailsRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { includeAvailablePaymentGroups } = req.query;
    const { feeRecordIds } = req.body;

    const includeAvailablePaymentGroupsQuery = includeAvailablePaymentGroups === 'true';
    const selectedFeeRecordsDetails = await api.getSelectedFeeRecordsDetails(id, feeRecordIds, includeAvailablePaymentGroupsQuery);

    res.status(200).send(selectedFeeRecordsDetails);
  } catch (error) {
    const errorMessage = 'Failed to get selected fee records details';
    console.error(errorMessage, error);
    const statusCode = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    res.status(statusCode).send(errorMessage);
  }
};
