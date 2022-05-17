const MOCK_DEAL = {
  _id: '61f6ac5b02ffda01b1e8efef',
  dealSnapshot: {
    _id: '61f6ac5b02ffda01b1e8efef',
    submissionType: 'Manual Inclusion Application',
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

const MOCK_TEAM_UNDERWRITER_MANAGERS = [
  MOCK_USER_UNDERWRITER_MANAGER,
];

const session = {
  user: MOCK_USER_UNDERWRITER_MANAGER,
};

const MOCK_AMENDMENT = {
  amendments: {
    amendmentId: '12345',
    facilityId: '45678',
    dealId: '999',
  },
  type: 'Cash',
  ukefFacilityId: '123',
};

const MOCK_AMENDMENT_PROGRESS = {
  amendmentId: '12345',
  facilityId: '45678',
  dealId: '999',
  type: 'Cash',
  ukefFacilityId: '123',
};

const MOCK_AMENDMENT_PROGRESS_FULL = {
  status: 200,
  data: {
    amendmentId: '12345',
    facilityId: '45678',
    dealId: '999',
    type: 'Cash',
    ukefFacilityId: '123',
  },
};

const MOCK_AMENDMENT_FULL = {
  status: 200,
  data: {
    amendments: {
      amendmentId: '12345',
      facilityId: '45678',
      dealId: '999',
    },
    type: 'Cash',
    ukefFacilityId: '123',
  },
};

const MOCK_USER_UNDERWRITER = {
  _id: '100200300',
  username: 'UNDERWRITER_1',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['UNDERWRITERS'],
  email: 'test@test.com',
};

const sessionUnderwriter = {
  user: MOCK_USER_UNDERWRITER,
};

module.exports = {
  MOCK_DEAL,
  MOCK_USER_UNDERWRITER_MANAGER,
  session,
  MOCK_AMENDMENT,
  MOCK_AMENDMENT_PROGRESS,
  MOCK_AMENDMENT_PROGRESS_FULL,
  MOCK_AMENDMENT_FULL,
  MOCK_TEAM_UNDERWRITER_MANAGERS,
  MOCK_USER_UNDERWRITER,
  sessionUnderwriter,
};
