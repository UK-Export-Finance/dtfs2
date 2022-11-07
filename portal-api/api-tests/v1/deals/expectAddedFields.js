const CONSTANTS = require('../../../src/constants');
const { expectMongoId } = require('../../expectMongoIds');

const expectAddedFields = (obj) => {
  const expectation = expectMongoId({
    dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS,
    status: 'Draft',
    eligibility: {
      status: 'Not started',
      _id: expect.any(String),
      version: expect.any(Number),
      updatedAt: expect.any(Number),
      createdAt: expect.any(Number),
      criteria: expect.any(Array),
      dealType: expect.any(String)
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
    maker: expect.any(Object),
    bank: expect.any(Object),
    details: {
      ...obj.details,
      created: expect.any(Number),
    },
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
