/* eslint-disable no-underscore-dangle */
const CONSTANTS = require('../../constants');
const Application = require('../../models/application');
const api = require('../../services/api');

const applicationIsAbandonable = (application) => [CONSTANTS.DEAL_STATUS.DRAFT,
  CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED,
  CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL].includes(application.status);

const dashboardUrl = '/dashboard';

const confirmAbandonApplication = async (req, res, next) => {
  const {
    params,
    session,
  } = req;
  const { dealId } = params;
  const { user, userToken } = session;
  let application;
  try {
    application = await Application.findById(dealId, user, userToken);

    if (!application) {
      return res.redirect(dashboardUrl);
    }
    if (!applicationIsAbandonable(application)) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }
  } catch (err) {
    return next(err);
  }
  return res.render('application-abandon.njk', { application });
};

const abandonApplication = async (req, res, next) => {
  const { params, session } = req;
  const { dealId } = params;
  const { user, userToken } = session;
  try {
    const application = await Application.findById(dealId, user, userToken);
    if (applicationIsAbandonable(application)) {
      await api.setApplicationStatus(dealId, CONSTANTS.DEAL_STATUS.ABANDONED);
    }
  } catch (err) {
    return next(err);
  }
  return res.redirect(dashboardUrl);
};

module.exports = {
  confirmAbandonApplication,
  abandonApplication,
};
