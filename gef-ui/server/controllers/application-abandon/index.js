/* eslint-disable no-underscore-dangle */
import * as api from '../../services/api';
import { PROGRESS } from '../../../constants';
import Application from '../../models/application';

const applicationIsAbandonable = (application) => [PROGRESS.DRAFT,
  PROGRESS.CHANGES_REQUIRED,
  PROGRESS.BANK_CHECK].includes(application.status.toUpperCase());

const dashboardUrl = '/dashboard/gef';

export const confirmAbandonApplication = async (req, res, next) => {
  const {
    params,
    session,
  } = req;
  const { applicationId } = params;
  const { user, userToken } = session;
  let application;
  try {
    application = await Application.findById(applicationId, user, userToken);
    if (!application) {
      return res.redirect(dashboardUrl);
    }
    if (!applicationIsAbandonable(application)) {
      return res.redirect(`/gef/application-details/${applicationId}`);
    }
  } catch (err) {
    return next(err);
  }
  return res.render('application-abandon.njk', { application });
};

export const abandonApplication = async (req, res, next) => {
  const { params, session } = req;
  const { applicationId } = params;
  const { user, userToken } = session;
  try {
    const application = await Application.findById(applicationId, user, userToken);
    if (applicationIsAbandonable(application)) {
      await api.setApplicationStatus(applicationId, PROGRESS.ABANDONED);
    }
  } catch (err) {
    return next(err);
  }
  return res.redirect(dashboardUrl);
};

export default {
  confirmAbandonApplication,
  abandonApplication,
};
