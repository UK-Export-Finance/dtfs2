const { CHECKER } = require('../constants/roles');
const { equalArrays } = require('./equalArrays.helper');

// TODO DTFS2-6635: this function returns false if a user has checker plus another role,
// which is surprising. Is this correct?
const isChecker = (roles) => {
  const checker = [CHECKER];
  return equalArrays(roles, checker);
};

module.exports = { isChecker };
