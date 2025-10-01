import { Request, Response } from 'express';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';

/**
 * Controller to download utilisation reports
 * @async
 * @function getReportDownload
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
export const getReportDownload = async (req: Request, res: Response) => {
  try {
    const { userToken } = asUserSession(req.session);
    const { id } = req.params;

    const { data, headers } = await api.downloadUtilisationReport(userToken, id);

    res.set('content-disposition', headers['content-disposition']);
    res.set('content-type', headers['content-type']);

    data.pipe(res);
  } catch (error) {
    console.error('Failed to download utilisation report', error);
    res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
