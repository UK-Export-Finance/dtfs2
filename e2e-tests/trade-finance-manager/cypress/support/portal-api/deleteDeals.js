const {
  logIn,
  deleteDeal,
} = require('./api');

const deleteOneDeal = (token, dealId) =>
  deleteDeal(token, dealId);

module.exports = (dealId, user) => {
  console.info('deleteOneDeal::');

  return logIn(user).then((token) =>
    new Cypress.Promise((resolve) => {
      deleteOneDeal(token, dealId);
      resolve();
    }));
};
