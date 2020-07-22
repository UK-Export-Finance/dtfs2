const { expectMongoId } = require('../../expectMongoIds');

const expectAddedFields = (obj) => {
  const expectation = expectMongoId({
    eligibility: {
      status: 'Incomplete',
      criteria: expect.any(Array),
    },
    submissionDetails: {
      status: 'Not Started',
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
    details: {
      ... obj.details,
      created: expect.any(String),
      dateOfLastAction: expect.any(String),
      maker: expect.any(Object),
      owningBank: expect.any(Object),
      status: 'Draft',
    },
    editedBy: [],
  });

  return expectation;
}

const expectedEditedByObject = (user) => ({
  date: expect.any(String),
  username: user.username,
  roles: user.roles,
  bank: user.bank,
  userId: user._id,
});

const expectAddedFieldsWithEditedBy = (obj, user, numberOfUpdates = 1) => {
  let expectedEditedByArray = new Array(numberOfUpdates);
  expectedEditedByArray.fill(expectedEditedByObject(user));

  const expectation = expectMongoId({
    ...expectAddedFields(obj),
    editedBy: expectedEditedByArray,
  });

  return expectation;
};

const expectAllAddedFields = (list) => list.map(expectAddedFields);

module.exports = {
  expectAddedFields,
  expectAllAddedFields,
  expectAddedFieldsWithEditedBy,
};
