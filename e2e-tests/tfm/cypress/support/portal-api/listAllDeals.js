const { listAllDeals, logIn } = require('./api');

/**
 * lists all portal deals in the database
 */
module.exports = (opts) => {
  console.info('listAllDeals::');
  logIn(opts).then((token) => {
    listAllDeals(token).then((deals) => {
      return deals;
    });
  });
};
