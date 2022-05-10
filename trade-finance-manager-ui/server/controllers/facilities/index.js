const api = require('../../api');

const getFacilities = async (req, res) => {
  const apiResponse = await api.getFacilities();

  const { data: amendments } = await api.getAllAmendmentsInProgress();

  // override the deal stage if there is an amendment in progress
  if (amendments?.length > 0) {
    amendments.map((item) => {
      const hasBeenSubmitted = item.amendments.submittedByPim ?? false;
      if (hasBeenSubmitted) {
        return apiResponse.facilities.map((facility) => {
          if (item.amendments.facilityId === facility.facilityId) {
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
      activePrimaryNavigation: 'all facilities',
      activeSubNavigation: 'facility',
      user: req.session.user,
    });
  }

  return res.redirect('/not-found');
};

const queryFacilities = async (req, res) => {
  const searchString = req.body.search || '';

  const queryParams = { searchString };
  const apiResponse = await api.getFacilities(queryParams);

  const { data: amendments } = await api.getAllAmendmentsInProgress();

  // override the deal stage if there is an amendment in progress
  if (amendments?.length > 0) {
    amendments.map((item) => {
      const hasBeenSubmitted = item?.amendments?.submittedByPim ?? false;
      if (hasBeenSubmitted) {
        return apiResponse.facilities.map((facility) => {
          if (item.amendments.facilityId === facility.facilityId) {
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
    activePrimaryNavigation: 'all facilities',
    activeSubNavigation: 'facility',
    user: req.session.user,
  });
};

module.exports = { getFacilities, queryFacilities };
