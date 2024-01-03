import { Request, Response } from 'express';
import stream from 'stream';
import api from '../../../api';
import { asString } from '../../../helpers/validation';

export const getReportDownload = async (req: Request, res: Response) => {
  try {
    const { userToken } = req.session;
    const { _id } = req.params;

    const { data, headers } = await api.downloadUtilisationReport(asString(userToken, 'userToken'), _id);

    res.set('content-disposition', headers['content-disposition']);
    res.set('content-type', headers['content-type']);

    const readStream = new stream.PassThrough();
    data.pipe(readStream).pipe(res);
  } catch (error) {
    console.error('Failed to download utilisation report', error);
    res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
