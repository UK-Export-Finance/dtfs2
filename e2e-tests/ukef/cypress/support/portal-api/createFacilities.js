const { logIn, createFacilities } = require('./api');

module.exports = (dealId, facilities, user) => {
  console.info('createFacilities::');

  logIn(user).then((token) => {
    createFacilities(
      dealId,
      facilities,
      user,
      token,
    ).then((createdFacilities) => createdFacilities);
  });
};
