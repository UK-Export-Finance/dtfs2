const { expectMongoId } = require('../../expectMongoIds');

const expectAddedFields = (obj) => expectMongoId({
  details: {
  },
  eligibility: {
    status: 'Initial',
    criteria: expect.any(Array),
  },
  bondTransactions: {
    items: [],
  },
  loanTransactions: {
    items: [],
  },
  summary: {},
  comments: [],
  ...obj,
  created: expect.any(String),
  updated: expect.any(String),
});

const expectAllAddedFields = (list) => list.map(expectAddedFields);

module.exports = {
  expectAddedFields,
  expectAllAddedFields,
};
