const CONSTANTS = require('../../../src/constants');
const { expectMongoId } = require('../../expectMongoIds');

const expectAddedFields = (obj) => {
  let eligibilityLastUpdated = null;
  if (obj.eligibility && obj.eligibility.lastUpdated) {
    eligibilityLastUpdated = obj.eligibility.lastUpdated;
  }

  const expectation = expectMongoId({
    dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS,
    eligibility: {
      status: 'Not started',
      criteria: expect.any(Array),
      lastUpdated: expect.toBeNumberOrNull(eligibilityLastUpdated),
    },
    submissionDetails: {
      status: 'Not started',
    },
    facilities: [],
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
    },
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
