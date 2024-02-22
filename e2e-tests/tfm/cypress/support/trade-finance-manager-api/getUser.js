const { getUser } = require('./api');

module.exports = (usernameToGet, opts) => {
  console.info('getUser::');

  return cy.login(opts).then((token) => getUser(usernameToGet, token));
};
