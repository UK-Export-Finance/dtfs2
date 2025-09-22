import { HttpStatusCode, isAxiosError } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

type PostKeyingDataRequest = CustomExpressRequest<{
  reqBody: {
    user: TfmSessionUser;
  };
}>;

/**
 * Generates keying data for the utilisation report with the supplied id
 * @param {import('express').Request<{ reportId: string }>} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const postKeyingData = async (req: PostKeyingDataRequest, res: Response) => {
  const { reportId } = req.params;
  const { user } = req.body;

  try {
    await api.generateKeyingData(reportId, user);

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to generate keying data';
    console.error(errorMessage, error);
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(errorStatus).send(errorMessage);
  }
};
