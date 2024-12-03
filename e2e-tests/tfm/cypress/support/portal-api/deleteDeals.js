const { logIn, deleteDeal } = require('./api');

const deleteOneDeal = (token, dealId) => {
  if (dealId) {
    return deleteDeal(token, dealId);
  }

  return false;
};

module.exports = (dealId, user) => {
  console.info('deleteOneDeal::');

  return logIn(user).then(
    (token) =>
      new Cypress.Promise((resolve) => {
        deleteOneDeal(token, dealId);
        resolve();
      }),
  );
};
