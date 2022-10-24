const { insertGefFacility, logIn } = require('./api');

module.exports = (facilities, opts) => {
  console.info('createManyGefFacilities::');
  logIn(opts).then((token) => {
    const persisted = [];

    for (const facility of facilities) {
      insertGefFacility(facility, token).then((response) => {
        persisted.push(response);
        if (persisted.length === facilities.length) {
          return persisted;
        }
      });
    }
  });
};
