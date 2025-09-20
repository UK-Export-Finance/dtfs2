import { HttpStatusCode, isAxiosError } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

type PutKeyingDataMarkAsDoneRequest = CustomExpressRequest<{
  reqBody: {
    user: TfmSessionUser;
    feeRecordIds: number[];
  };
}>;

/**
 * Updates mark keying data as done
 * @param {import('express').Request<{ reportId: string }>} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const putKeyingDataMarkAsDone = async (req: PutKeyingDataMarkAsDoneRequest, res: Response) => {
  const { reportId } = req.params;
  const { feeRecordIds, user } = req.body;

  try {
    await api.markKeyingDataAsDone(reportId, feeRecordIds, user);

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to mark keying data as done';
    console.error(errorMessage, error);
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(errorStatus).send(errorMessage);
  }
};
