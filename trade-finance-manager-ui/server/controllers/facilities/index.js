const api = require('../../api');
const CONSTANTS = require('../../constants');

const getFacilities = async (req, res) => {
  const { userToken } = req.session;
  // Query parameters have been implemented in APIs but aren't currently used in frontends
  const apiResponse = await api.getFacilities(userToken);

  const { data: amendments } = await api.getAllAmendmentsInProgress(userToken);

  // override the deal stage if there is an amendment in progress
  if (Array.isArray(amendments) && amendments?.length > 0) {
    amendments.map((item) => {
      const amendmentInProgress = item.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
      if (amendmentInProgress) {
        return apiResponse.facilities.map((facility) => {
          if (item.facilityId === facility.facilityId) {
            // eslint-disable-next-line no-param-reassign
            facility.hasAmendmentInProgress = true;
          }
          return facility;
        });
      }
      return item;
    });
  }

  if (apiResponse) {
    return res.render('facilities/facilities.njk', {
      heading: 'All facilities',
      facilities: apiResponse.facilities,
      activePrimaryNavigation: CONSTANTS.PRIMARY_NAVIGATION_ITEMS.ALL_FACILITIES,
      activeSubNavigation: 'facility',
      user: req.session.user,
    });
  }

  return res.redirect('/not-found');
};

const queryFacilities = async (req, res) => {
  const searchString = req.body.search || '';
  const { userToken } = req.session;

  const apiResponse = await api.getFacilities(userToken, searchString);

  const { data: amendments } = await api.getAllAmendmentsInProgress(userToken);

  // override the deal stage if there is an amendment in progress
  if (Array.isArray(amendments) && amendments?.length > 0) {
    amendments.map((item) => {
      const amendmentInProgress = item.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
      if (amendmentInProgress) {
        return apiResponse.facilities.map((facility) => {
          if (item.facilityId === facility.facilityId) {
            // eslint-disable-next-line no-param-reassign
            facility.hasAmendmentInProgress = true;
          }
          return facility;
        });
      }
      return item;
    });
  }

  return res.render('facilities/facilities.njk', {
    heading: 'All facilities',
    facilities: apiResponse.facilities,
    activePrimaryNavigation: CONSTANTS.PRIMARY_NAVIGATION_ITEMS.ALL_FACILITIES,
    activeSubNavigation: 'facility',
    user: req.session.user,
  });
};

module.exports = { getFacilities, queryFacilities };
