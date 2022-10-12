const Chance = require('chance');
const aDeal = require('../deal-builder');
const CONSTANTS = require('../../../src/constants');

const chance = new Chance();

const MOCK_DEAL_ID = '61e54dd5b578247e14575882';
exports.MOCK_DEAL_ID = MOCK_DEAL_ID;

exports.MOCK_USER = {
  _id: chance.integer(),
  username: chance.word(),
  roles: [],
  bank: {
    id: chance.integer(),
    name: chance.name(),
  },
};

exports.MOCK_BSS_FACILITY = {
  dealId: MOCK_DEAL_ID,
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
};

exports.MOCK_BSS_DEAL = aDeal({
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  dealID: MOCK_DEAL_ID,
  additionalRefName: chance.word(),
  bankInternalRefName: chance.word(),
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});
