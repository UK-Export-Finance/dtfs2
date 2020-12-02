const {
  logIn,
  deleteDeal,
} = require('./api');

const deleteOneDeal = (token, dealId) =>
  deleteDeal(token, dealId);

module.exports = (dealId, user) => {
  console.log('deleteOneDeal::');

  return logIn(user).then((token) => {
    // return listAllDeals(token).then( (deals) => {

    return new Cypress.Promise((resolve) => {
      deleteOneDeal(token, dealId);
      resolve();
    });

    // });
  });
}
