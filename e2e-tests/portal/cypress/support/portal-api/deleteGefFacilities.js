const { listGefFacilities, logIn, deleteGefFacility } = require('./api');

const deleteGefFacilities = (token, facilities) => {
  if (!facilities || !facilities.length) return;
  facilities.forEach(async (facility) => deleteGefFacility(token, facility));
};

module.exports = (opts, applicationId) => logIn(opts).then((token) => {
  listGefFacilities(token, applicationId).then(async (facilities) => {
    await deleteGefFacilities(token, facilities);
  });
});
