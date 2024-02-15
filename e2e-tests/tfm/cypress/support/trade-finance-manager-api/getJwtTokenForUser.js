const { getJwtTokenForUser } = require('./api');

module.exports = (dealId, dealType, opts) => {
  const { user } = opts;
  return getJwtTokenForUser(dealId, dealType, null, user);
};
