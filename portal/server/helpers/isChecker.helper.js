const { CHECKER } = require('../constants/roles');
const { equalArrays } = require('./equalArrays.helper');

const isChecker = (roles) => {
  const checker = [CHECKER];
  return equalArrays(roles, checker);
};

module.exports = { isChecker };
