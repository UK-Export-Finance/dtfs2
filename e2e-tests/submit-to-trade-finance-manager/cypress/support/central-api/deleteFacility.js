const { deleteFacility } = require('./api');

module.exports = (facilityId, user) => {
  console.log('deleteFacility::');
  deleteFacility(facilityId, user);
};
