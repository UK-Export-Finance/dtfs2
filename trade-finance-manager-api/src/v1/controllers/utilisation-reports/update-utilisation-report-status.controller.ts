import { Request, Response } from 'express';
import axios from 'axios';
import { ReportWithStatus } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../types/tfm-session-user';
import api from '../../api';

export type UpdateUtilisationReportStatusRequestBody = {
  user: TfmSessionUser;
  reportsWithStatus: ReportWithStatus[];
};

export const updateUtilisationReportStatus = async (
  req: Request<object, object, UpdateUtilisationReportStatusRequestBody>,
  res: Response,
) => {
  try {
    const { reportsWithStatus, user } = req.body;

    await api.updateUtilisationReportStatus(reportsWithStatus, user);

    return res.sendStatus(204);
  } catch (error) {
    console.error('Unable to update utilisation report status:', error);
    const statusCode = (axios.isAxiosError(error) && error.response?.status) || 500;
    return res.status(statusCode).send({ data: 'Unable to update utilisation report status' });
  }
};
