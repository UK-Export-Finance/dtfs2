const { getUser } = require('./api');

module.exports = (usernameToGet, user) => {
  console.info('getUser::');

  return cy.tfmLogin({
    user,
    isSessionForAPI: true,
  }).then((token) => getUser(usernameToGet, token));
};
