import { Request, Response } from 'express';
import { TfmSessionUser } from '../../../types/tfm-session-user';
import { ReportWithStatus } from '../../../types/utilisation-report-service';
import api from '../../api';
import axios from 'axios';

type RequestBody = {
  user: TfmSessionUser;
  reportsWithStatus: ReportWithStatus[];
};

export const updateUtilisationReportStatus = async (req: Request<{}, {}, RequestBody>, res: Response) => {
  try {
    const { reportsWithStatus, user } = req.body;

    await api.updateUtilisationReportStatus(reportsWithStatus, user);

    return res.sendStatus(204);
  } catch (error) {
    console.error('Unable to update utilisation report status:', error);
    if (axios.isAxiosError(error)) {
      return res.status(error.status || 500).send({ data: 'Unable to update utilisation report status' });
    }
    return res.status(500).send({ data: 'Unable to update utilisation report status' });
  }
};
