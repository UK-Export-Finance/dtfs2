import { HttpStatusCode, isAxiosError } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

type PostKeyingDataRequest = CustomExpressRequest<{
  reqBody: {
    user: TfmSessionUser;
  };
}>;

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
