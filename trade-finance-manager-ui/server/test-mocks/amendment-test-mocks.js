const CONSTANTS = require('../constants');

const MOCK_DEAL = {
  _id: '61f6ac5b02ffda01b1e8efef',
  dealSnapshot: {
    _id: '61f6ac5b02ffda01b1e8efef',
    submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
  },
  tfm: {
    leadUnderwriter: '12345678910',
  },
};
const MOCK_USER_UNDERWRITER_MANAGER = {
  _id: '12345678',
  username: 'UNDERWRITER_MANAGER_1',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['UNDERWRITER_MANAGERS'],
};

const MOCK_USER_UNDERWRITER = {
  _id: '100200300',
  username: 'UNDERWRITER_1',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['UNDERWRITERS'],
  email: 'test@test.com',
};

const MOCK_USER_PIM = {
  _id: '12345678',
  username: 'PIM',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['PIM'],
  email: 'testPim@test.com',
};

const MOCK_TEAM_UNDERWRITER_MANAGERS = [
  MOCK_USER_UNDERWRITER_MANAGER,
];

const session = {
  user: MOCK_USER_UNDERWRITER_MANAGER,
};

const MOCK_AMENDMENT = {
  amendmentId: '12345',
  facilityId: '45678',
  dealId: '999',
  ukefFacilityId: '123',
  type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
  status: CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS,
  submittedByPim: false,
};

const MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED = {
  ...MOCK_AMENDMENT,
  ukefDecision: {
    reason: 'a reason for declining the amendment',
    conditions: 'a set of conditions for this amendment',
    comments: 'extra comments',
    submitted: false,
  },
};

const MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED = {
  ...MOCK_AMENDMENT,
  ukefDecision: {
    reason: 'a reason for declining the amendment',
    conditions: 'a set of conditions for this amendment',
    comments: 'extra comments',
    submitted: true,
  },
};

const MOCK_AMENDMENT_LEAD_UNDERWRITER = {
  ...MOCK_AMENDMENT,
  leadUnderwriterId: '12345678',
};

module.exports = {
  MOCK_DEAL,
  MOCK_USER_UNDERWRITER_MANAGER,
  session,
  MOCK_AMENDMENT,
  MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED,
  MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED,
  MOCK_AMENDMENT_LEAD_UNDERWRITER,
  MOCK_TEAM_UNDERWRITER_MANAGERS,
  MOCK_USER_UNDERWRITER,
  MOCK_USER_PIM,
};
