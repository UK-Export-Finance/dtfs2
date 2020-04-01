const { expectMongoId } = require('../../expectMongoIds');

const expectAddedFields = (obj) => {
  const expectation = expectMongoId({
    details: {},
    eligibility: {
      status: 'Incomplete',
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
    ... obj,
    created: expect.any(String),
    updated: expect.any(String),
  });

  expectation.details.maker = expect.any(Object);
  expectation.details.owningBank = expect.any(Object);

  return expectation;
}

const expectAllAddedFields = list => list.map(expectAddedFields);

module.exports = {
  expectAddedFields,
  expectAllAddedFields
}
