const { addAuditRecordToExpectedResponse } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const CONSTANTS = require('../../../src/constants');
const { expectMongoId } = require('../../expectMongoIds');

const addBaseFields = (baseDeal) => {
  return expectMongoId({
    dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS,
    status: 'Draft',
    eligibility: {
      _id: expect.any(String),
      version: expect.any(Number),
      product: expect.any(String),
      createdAt: expect.any(Number),
      criteria: expect.any(Array),
      isInDraft: expect.any(Boolean),
      status: expect.any(String),
      auditRecord: expect.any(Object),
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
    ...baseDeal,
    maker: expect.any(Object),
    bank: expect.any(Object),
    details: {
      ...baseDeal.details,
      created: expect.any(Number),
    },
    editedBy: [],
    exporter: expect.any(Object),
    updatedAt: expect.any(Number),
  });
};

const expectAddedFields = ({ baseDeal, auditDetails }) => {
  const expectation = addBaseFields(baseDeal);
  const expectationWithAuditRecord = addAuditRecordToExpectedResponse({ baseResponse: expectation, auditDetails });

  return expectationWithAuditRecord;
};

const expectedEditedByObject = (user) => ({
  date: expect.any(Number),
  username: user.username,
  roles: user.roles,
  bank: user.bank,
  userId: user._id,
});

const expectAddedFieldsWithEditedBy = (baseDeal, user, numberOfUpdates = 1) => {
  const expectedEditedByArray = new Array(numberOfUpdates);
  expectedEditedByArray.fill(expectedEditedByObject(user));

  const expectation = expectMongoId({
    ...addBaseFields(baseDeal),
    editedBy: expectedEditedByArray,
  });

  return expectation;
};

module.exports = {
  expectAddedFields,
  expectAddedFieldsWithEditedBy,
};
