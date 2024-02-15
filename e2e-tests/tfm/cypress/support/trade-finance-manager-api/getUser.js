const { getUser } = require('./api');

module.exports = (usernameToGet, opts) => {
  console.info('getUser::');

  return cy.mockLogin(opts).then((token) => getUser(usernameToGet, token));
};
