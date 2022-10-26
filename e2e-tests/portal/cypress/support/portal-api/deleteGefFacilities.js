const { listGefFacilities, logIn, deleteGefFacility } = require('./api');

const deleteGefFacilities = (facilities, token) => {
  if (!facilities || !facilities.length) return;
  facilities.forEach((facility) => deleteGefFacility(token, facility));
};

module.exports = (dealId, opts) => logIn(opts).then((token) => {
  listGefFacilities(token, dealId).then(async (facilities) => {
    await deleteGefFacilities(facilities, token);
  });
});
