const { updateExporter, logIn, listAllUsers } = require('./api');

module.exports = (deals, exporter, opts) => {
  logIn(opts).then((token) => {
    const persisted = [];
    listAllUsers(token).then(({ body: { users } }) => {
      const userId = users.find((user) => user.username === opts.username)._id;

      let i = 0;
      deals.forEach((deal) => {
        // eslint-disable-next-line no-param-reassign
        deal.userId = userId;
        // eslint-disable-next-line consistent-return
        updateExporter(deal, exporter[i], token).then((response) => {
          persisted.push(response);
          if (persisted.length === deals.length) {
            return persisted;
          }
        });
        i += 1;
      });
    });
  });
};
