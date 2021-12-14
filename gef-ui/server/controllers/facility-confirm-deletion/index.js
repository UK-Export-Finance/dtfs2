const startCase = require('lodash/startCase');
const { FACILITY_TYPE } = require('../../constants');
const api = require('../../services/api');

const facilityConfirmDeletion = async (req, res) => {
  const { params } = req;
  const { applicationId, facilityId } = params;

  try {
    const { details } = await api.getFacility(facilityId);
    const heading = startCase(FACILITY_TYPE[details.type].toLowerCase());

    return res.render('partials/facility-confirm-deletion.njk', {
      heading,
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const deleteFacility = async (req, res) => {
  const { params } = req;
  const { applicationId, facilityId } = params;

  try {
    await api.deleteFacility(facilityId);

    return res.redirect(`/gef/application-details/${applicationId}`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  facilityConfirmDeletion,
  deleteFacility,
};
