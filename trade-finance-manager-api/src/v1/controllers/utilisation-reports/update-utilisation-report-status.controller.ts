import { Request, Response } from 'express';
import axios from 'axios';
import { TfmSessionUser } from '../../../types/tfm-session-user';
import { ReportWithStatus } from '../../../types/utilisation-report-service';
import api from '../../api';

type RequestBody = {
  user: TfmSessionUser;
  reportsWithStatus: ReportWithStatus[];
};

export const updateUtilisationReportStatus = async (req: Request<object, object, RequestBody>, res: Response) => {
  try {
    const { reportsWithStatus, user } = req.body;

    await api.updateUtilisationReportStatus(reportsWithStatus, user);

    return res.sendStatus(204);
  } catch (error) {
    console.error('Unable to update utilisation report status:', error);
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).send({ data: `Unable to update utilisation report status: ${error.message}` });
    }
    return res.status(500).send({ data: 'Unable to update utilisation report status' });
  }
};
