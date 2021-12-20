const api = require('../../api');

const getFacilities = async (req, res) => {
  const apiResponse = await api.getFacilities();

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

  return res.render('facilities/facilities.njk', {
    heading: 'All facilities',
    facilities: apiResponse.facilities,
    activePrimaryNavigation: 'all facilities',
    activeSubNavigation: 'facility',
    user: req.session.user,
  });
};

module.exports = { getFacilities, queryFacilities };
