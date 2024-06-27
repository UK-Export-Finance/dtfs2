import { HttpStatusCode, isAxiosError } from 'axios';
import { Request, Response } from 'express';
import api from '../../api';

export const postKeyingData = async (req: Request, res: Response) => {
  const { reportId } = req.params;

  try {
    await api.generateKeyingData(reportId);

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to generate keying data';
    console.error(errorMessage, error);
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(errorStatus).send(errorMessage);
  }
};
