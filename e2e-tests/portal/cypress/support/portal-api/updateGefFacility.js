const { updateGefFacility, logIn } = require('./api');

module.exports = (facilityId, payload, opts) => {
  console.info('updateGefFacility::');

  logIn(opts).then((token) => updateGefFacility(facilityId, payload, token).then((facility) => facility));
};
