const { expectMongoId } = require('../../expectMongoIds');

const expectAddedFields = (obj) => {
  const expectation = expectMongoId({
    eligibility: {
      status: 'Not started',
      criteria: expect.any(Array),
    },
    submissionDetails: {
      status: 'Not started',
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
      status: 'DRAFT',
    },
    facilities: [],
    editedBy: [],
  });

  return expectation;
};

const expectedEditedByObject = (user) => ({
  date: expect.any(String),
  username: user.username,
  roles: user.roles,
  bank: user.bank,
  userId: user._id,
});

const expectAddedFieldsWithEditedBy = (obj, user, numberOfUpdates = 1) => {
  const expectedEditedByArray = new Array(numberOfUpdates);
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
