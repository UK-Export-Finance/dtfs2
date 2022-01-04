const { insertGefApplication, logIn, listAllUsers } = require('./api');

module.exports = (deals, opts) => {
  console.log('createManyGefApplications::');

  logIn(opts).then((token) => {
    const persisted = [];
    listAllUsers(token).then((users) => {
      const userId = users.find((user) => user.username === opts.username)._id;

      for (const deal of deals) {
        deal.userId = userId;
        insertGefApplication(deal, token).then((response) => {
          persisted.push(response);
          if (persisted.length === deals.length) {
            return persisted;
          }
        });
      }
    });
  });
};
