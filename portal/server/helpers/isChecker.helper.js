const { equalArrays } = require('./equalArrays.helper');

const isChecker = (roles) => {
  const checker = ['checker'];
  return equalArrays(roles, checker);
};

module.exports = { isChecker };
