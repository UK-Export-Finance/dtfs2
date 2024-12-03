const { setGefApplicationStatus, logIn } = require('./api');

module.exports = (id, status, opts) => {
  console.info('setGefApplicationStatus::');

  logIn(opts).then((token) => setGefApplicationStatus(id, token, status).then((deal) => deal));
};
