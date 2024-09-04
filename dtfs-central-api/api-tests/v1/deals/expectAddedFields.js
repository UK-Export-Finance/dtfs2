import { addAuditRecordToExpectedResponse } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { expectMongoId } from '../../expectMongoIds';

const addBaseFields = (baseDeal) => {
  let eligibilityUpdate;
  if (baseDeal.eligibility) {
    eligibilityUpdate = baseDeal.eligibility;
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
    ...baseDeal,
    maker: expect.any(Object),
    bank: expect.any(Object),
    details: {
      ...baseDeal.details,
      created: expect.any(Number),
    },
    facilities: [],
    editedBy: [],
    exporter: expect.any(Object),
    updatedAt: expect.any(Number),
  });

  return expectation;
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

const expectAddedFieldsWithEditedBy = ({ baseDeal, user, auditDetails, numberOfUpdates = 1 }) => {
  const expectedEditedByArray = new Array(numberOfUpdates);
  expectedEditedByArray.fill(expectedEditedByObject(user));

  const expectation = expectMongoId({
    ...addBaseFields(baseDeal),
    editedBy: expectedEditedByArray,
  });

  const expectationWithAuditRecord = addAuditRecordToExpectedResponse({ baseResponse: expectation, auditDetails });

  return expectationWithAuditRecord;
};

export { expectAddedFields, expectAddedFieldsWithEditedBy };
