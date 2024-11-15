const startCase = require('lodash/startCase');
const { FACILITY_TYPE } = require('../../constants');
const api = require('../../services/api');

const facilityConfirmDeletion = async (req, res) => {
  const {
    params,
    session: { userToken },
  } = req;
  const { dealId, facilityId } = params;

  try {
    const { details } = await api.getFacility({ facilityId, userToken });
    const heading = startCase(FACILITY_TYPE[details.type.toUpperCase()].toLowerCase());

    return res.render('_partials/facility-confirm-deletion.njk', {
      heading,
      dealId,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk');
  }
};

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
    return res.render('_partials/problem-with-service.njk');
  }
};

module.exports = {
  facilityConfirmDeletion,
  deleteFacility,
};
