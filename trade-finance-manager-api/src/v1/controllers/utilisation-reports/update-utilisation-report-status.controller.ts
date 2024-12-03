import { Request, Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { ReportWithStatus, TfmSessionUser } from '@ukef/dtfs2-common';
import api from '../../api';

export type UpdateUtilisationReportStatusRequestBody = {
  user: TfmSessionUser;
  reportsWithStatus: ReportWithStatus[];
};

export const updateUtilisationReportStatus = async (req: Request<object, object, UpdateUtilisationReportStatusRequestBody>, res: Response) => {
  try {
    const { reportsWithStatus, user } = req.body;

    await api.updateUtilisationReportStatus(reportsWithStatus, user);

    return res.sendStatus(204);
  } catch (error) {
    console.error('Unable to update utilisation report status:', error);
    const statusCode = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    return res.status(statusCode).send({ data: 'Unable to update utilisation report status' });
  }
};
