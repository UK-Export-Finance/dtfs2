/* eslint-disable no-underscore-dangle */
import * as api from '../../services/api';
import { PROGRESS } from '../../../constants';
import Application from '../../models/application';

export const confirmAbandonApplication = async (req, res, next) => {
  const {
    params,
    session,
  } = req;
  const { applicationId } = params;
  const { user, userToken } = session;

  try {
    const application = await Application.findById(applicationId, user, userToken);
    if (!application) {
      // 404 not found or unauthorised
      return res.redirect('/dashboard');
    }

    res.render('application-abandon.njk', { application });
  } catch (err) {
    return next(err);
  }
};

export const abandonApplication = async (req, res, next) => {
  const { params } = req;
  const { applicationId } = params;
  try {
    await api.setApplicationStatus(applicationId, PROGRESS.ABANDONED);
  } catch (err) {
    return next(err);
  }
  return res.redirect('/dashboard/gef');
};

export default {
  confirmAbandonApplication,
  abandonApplication,
};
