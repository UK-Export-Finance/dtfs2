const { expectMongoId } = require('../../expectMongoIds');

const expectAddedFields = (obj) => {
  let eligibilityUpdate;
  if (obj.eligibility) {
    eligibilityUpdate = obj.eligibility;
  }

  const expectation = expectMongoId({
    status: 'Draft',
    updatedAt: expect.any(Number),
    eligibility: {
      status: 'Not started',
      criteria: expect.any(Array),
      ...eligibilityUpdate,
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
      maker: expect.any(Object),
      owningBank: expect.any(Object),
    },
    facilities: [],
    editedBy: [],
    exporter: {},
  });

  return expectation;
};

const expectedEditedByObject = (user) => ({
  date: expect.any(Number),
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
