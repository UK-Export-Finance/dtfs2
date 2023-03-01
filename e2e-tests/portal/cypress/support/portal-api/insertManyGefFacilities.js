const { insertGefFacility, logIn } = require('./api');

module.exports = (facilities, opts) => {
  console.info('createManyGefFacilities::');
  logIn(opts).then((token) => {
    const persisted = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const facility of facilities) {
      // eslint-disable-next-line consistent-return
      insertGefFacility(facility, token).then((response) => {
        persisted.push(response);
        if (persisted.length === facilities.length) {
          return persisted;
        }
      });
    }
  });
};
