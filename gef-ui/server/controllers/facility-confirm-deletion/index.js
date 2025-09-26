const startCase = require('lodash/startCase');
const { FACILITY_TYPE } = require('../../constants');
const api = require('../../services/api');

/**
 * Controller to render the facility deletion confirmation page.
 *
 * @async
 * @function facilityConfirmDeletion
 * @param {import('express').Request} req - The Express request object
 * @param {string} req.params.dealId - The ID of the deal/application.
 * @param {string} req.params.facilityId - The ID of the facility to delete.
 * @param {Object} req.session.user - The current user object.
 * @param {string} req.session.userToken - The authentication token for API requests.
 * @param {import('express').Response} res - The Express response object
 * @returns {Promise<void>} Renders the appropriate view based on success or failure.
 */
const facilityConfirmDeletion = async (req, res) => {
  const {
    params,
    session: { userToken },
  } = req;
  const { dealId, facilityId } = params;

  try {
    const { details } = await api.getFacility({ facilityId, userToken });
    const heading = startCase(FACILITY_TYPE[details.type.toUpperCase()].toLowerCase());

    return res.render('partials/facility-confirm-deletion.njk', {
      heading,
      dealId,
    });
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * Deletes a facility and updates the application with the editor's ID.
 *
 * @async
 * @function deleteFacility
 * @param {Object} req - The Express request object.
 * @param {string} req.params.dealId - The ID of the deal/application.
 * @param {string} req.params.facilityId - The ID of the facility to delete.
 * @param {Object} req.session.user - The current user object.
 * @param {string} req.session.userToken - The authentication token for API requests.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Redirects to application details page on success, or renders an error page on failure.
 */
const deleteFacility = async (req, res) => {
  const { params, session } = req;
  const { dealId, facilityId } = params;
  const { user, userToken } = session;
  const { _id: editorId } = user;

  try {
    await api.deleteFacility({ facilityId, userToken });

    // updates application with editorId
    const applicationUpdate = {
      editorId,
    };
    await api.updateApplication({ dealId, application: applicationUpdate, userToken });

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  facilityConfirmDeletion,
  deleteFacility,
};
