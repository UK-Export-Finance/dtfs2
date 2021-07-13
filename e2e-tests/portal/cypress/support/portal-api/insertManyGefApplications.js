const { insertGefApplication, logIn } = require('./api');

module.exports = (deals, opts) => {
  console.log('createManyGefApplications::');

  logIn(opts).then((token) => {
    const persisted = [];

    for (const deal of deals) {
      insertGefApplication(deal, token).then((response) => {
        persisted.push(response);
        if (persisted.length === deals.length) {
          return persisted;
        }
      });
    }
  });
};
