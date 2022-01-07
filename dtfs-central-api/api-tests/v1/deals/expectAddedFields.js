const { expectMongoId } = require('../../expectMongoIds');

const expectAddedFields = (obj) => {
  let eligibilityUpdate;
  if (obj.eligibility) {
    eligibilityUpdate = obj.eligibility;
  }

  const expectation = expectMongoId({
    status: 'Draft',
    submissionType: expect.any(String),
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
    maker: expect.any(Object),
    bank: expect.any(Object),
    details: {
      ...obj.details,
      created: expect.any(String),
    },
    facilities: [],
    editedBy: [],
    exporter: expect.any(Object),
    updatedAt: expect.any(Number),
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
