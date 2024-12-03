const { ROLES } = require('@ukef/dtfs2-common');
const { equalArrays } = require('./equalArrays.helper');

const { CHECKER } = ROLES;

const isChecker = (roles) => {
  const checker = [CHECKER];
  return equalArrays(roles, checker);
};

module.exports = { isChecker };
