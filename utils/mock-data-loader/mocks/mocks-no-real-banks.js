const USERS = require('./users-no-real-banks');
const BANKS = require('./banks');
const MANDATORY_CRITERIA = require('./mandatoryCriteria');
const MANDATORY_CRITERIA_VERSIONED = require('./gef/mandatoryCriteriaVersioned');
const ELIGIBILITY_CRITERIA = require('./eligibilityCriteria');
const CONTRACTS = require('./contracts-no-real-banks');

const MOCKS = {
  USERS,
  BANKS,
  ELIGIBILITY_CRITERIA,
  MANDATORY_CRITERIA,
  MANDATORY_CRITERIA_VERSIONED,
  CONTRACTS,
};

module.exports = MOCKS;
