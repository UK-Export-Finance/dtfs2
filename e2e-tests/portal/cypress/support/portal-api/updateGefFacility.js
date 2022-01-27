const { updateGefFacility, logIn } = require('./api');

module.exports = (facilityId, payload, opts) => {
  console.log('updateGefFacility::');

  logIn(opts).then((token) => updateGefFacility(facilityId, payload, token).then((facility) => facility));
};
