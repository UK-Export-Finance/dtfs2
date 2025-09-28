const CONSTANTS = require('../../constants');
const Application = require('../../models/application');
const api = require('../../services/api');

const applicationIsAbandonable = (application) =>
  [CONSTANTS.DEAL_STATUS.DRAFT, CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED, CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL].includes(application.status);

const dashboardUrl = '/dashboard';

/**
 * Controller to render the application abandon confirmation page
 * @async
 * @function confirmAbandonApplication
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} Renders the application abandon page or redirects to dashboard.
 */
const confirmAbandonApplication = async (req, res, next) => {
  const { params, session } = req;
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
  } catch (error) {
    return next(error);
  }
  return res.render('application-abandon.njk', { application });
};

/**
 * Controller to handle abandoning an application
 * @async
 * @function abandonApplication
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const abandonApplication = async (req, res, next) => {
  const { params, session } = req;
  const { dealId } = params;
  const { user, userToken } = session;
  try {
    const application = await Application.findById(dealId, user, userToken);
    if (applicationIsAbandonable(application)) {
      await api.setApplicationStatus({ dealId, status: CONSTANTS.DEAL_STATUS.ABANDONED, userToken });
    }
  } catch (error) {
    return next(error);
  }
  return res.redirect(dashboardUrl);
};

module.exports = {
  confirmAbandonApplication,
  abandonApplication,
};
