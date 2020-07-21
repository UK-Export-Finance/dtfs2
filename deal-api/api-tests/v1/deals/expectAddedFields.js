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
      editedBy: [],
    },
  });

  return expectation;
}

const expectAddedFieldsWithEditedByObject = (obj, userObj) => {
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
    ...obj,
    details: {
      ...obj.details,
      created: expect.any(String),
      dateOfLastAction: expect.any(String),
      maker: expect.any(Object),
      owningBank: expect.any(Object),
      status: 'Draft',
      editedBy: [
        {
          date: expect.any(String),
          username: userObj.username,
          roles: userObj.roles,
          bank: userObj.bank,
          userId: userObj._id,
        }
      ],
    },
  });

  return expectation;
};

const expectAllAddedFields = (list) => list.map(expectAddedFields);

module.exports = {
  expectAddedFields,
  expectAllAddedFields,
  expectAddedFieldsWithEditedByObject,
};
