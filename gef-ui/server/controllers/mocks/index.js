const Chance = require('chance');
const { sub, getUnixTime } = require('date-fns');

const CONSTANTS = require('../../constants');

const chance = new Chance();

const MockResponse = () => ({
  redirect: jest.fn(),
  render: jest.fn(),
});

const MockRequest = () => ({
  params: { dealId: '123' },
  query: {},
  session: {
    user: {
      username: 'maker',
      bank: { id: 'BANKID' },
      roles: [CONSTANTS.USER_ROLES.MAKER],
      _id: 1235,
    },
    userToken: 'TEST',
  },
});

const MockRequestChecker = () => ({
  params: { dealId: '123' },
  query: {},
  session: {
    user: {
      bank: { id: 'BANKID' },
      roles: [CONSTANTS.USER_ROLES.CHECKER],
      _id: 1235,
    },
    userToken: 'TEST',
  },
});

const MockRequestUrl = (url) => ({
  params: { dealId: '123' },
  query: {},
  url,
  session: {
    user: {
      bank: { id: 'BANKID' },
      roles: [CONSTANTS.USER_ROLES.MAKER],
      _id: 1235,
    },
    userToken: 'TEST',
  },
});

const MockRequestUrlChecker = (url) => ({
  params: { dealId: '123' },
  query: {},
  url,
  session: {
    user: {
      bank: { id: 'BANKID' },
      roles: [CONSTANTS.USER_ROLES.CHECKER],
      _id: 1235,
    },
    userToken: 'TEST',
  },
});

const MockApplicationResponseDraft = () => ({
  _id: '1234',
  exporter: {},
  bank: { id: 'BANKID' },
  bankInternalRefName: 'Internal reference',
  additionalRefName: 'Additional reference',
  status: CONSTANTS.DEAL_STATUS.DRAFT,
  maker: { name: 'mock-user', timezone: 'Europe/London' },
  supportingInformation: {
    status: CONSTANTS.DEAL_STATUS.NOT_STARTED,
  },
  eligibility: {
    criteria: [
      { id: 12, answer: null, text: 'Test' },
    ],
  },
  editedBy: ['MAKER_CHECKER'],
  submissionType: 'Automatic Inclusion Application',
  submissionCount: 0,
  comments: [],
  ukefDealId: null,
  createdAt: chance.timestamp(),
});

const MockApplicationResponseSubmitted = () => {
  const now = new Date();
  const yesterday = sub(now, { days: 1 });

  return {
    _id: '1234',
    exporter: {},
    bank: { id: 'BANKID' },
    bankInternalRefName: 'Internal reference',
    additionalRefName: 'Additional reference',
    status: CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF,
    maker: { name: 'mock-user', timezone: 'Europe/London' },
    checkerId: 1235,
    supportingInformation: {
      status: CONSTANTS.DEAL_STATUS.COMPLETED,
    },
    eligibility: {
      criteria: [
        { id: 12, answer: null, text: 'Test' },
      ],
      status: CONSTANTS.DEAL_STATUS.COMPLETED,
    },
    editedBy: ['MAKER_CHECKER'],
    submissionType: 'Automatic Inclusion Notice',
    submissionCount: 1,
    comments: [],
    ukefDealId: 123456,
    createdAt: chance.timestamp(),
    // 449 is random number added to end to make unix timestamp in ms (breaks with seconds)
    submissionDate: `${getUnixTime(yesterday).toString()}449`,
    portalActivities: [{
      type: 'NOTICE',
      timestamp: chance.timestamp(),
      author: {
        firstName: 'Joe',
        lastName: 'Bloggs',
        id: 1235,
      },
      text: '',
      label: 'Automatic inclusion notice submitted to UKEF',
    }],
    manualInclusionNoticeSubmissionDate: `${getUnixTime(yesterday).toString()}449`,
  };
};

const MockUserResponse = () => ({
  username: 'maker',
  bank: { id: 'BANKID' },
  firstname: 'Joe',
  surname: 'Bloggs',
  timezone: 'Europe/London',
});

const MockUserResponseChecker = () => ({
  username: 'checker',
  bank: { id: 'BANKID' },
  firstname: 'Joe',
  surname: 'Bloggs',
  timezone: 'Europe/London',
});

const MockEligibilityCriteriaResponse = () => ({
  criteria: [
    {
      id: 12,
      text: 'Some eligibility criteria',
      errMsg: '12. Select some eligibility',
    },
  ],
});

const MockFacilityResponse = () => ({
  status: CONSTANTS.DEAL_STATUS.IN_PROGRESS,
  data: [],
  items: [{
    details: {
      type: CONSTANTS.FACILITY_TYPE.CASH,
      name: 'UKEF123',
      hasBeenIssued: false,
      monthsOfCover: null,
      coverStartDate: '2022-01-02T00:00:00.000+00:00',
      shouldCoverStartOnSubmission: true,
      coverEndDate: '2030-01-02T00:00:00.000+00:00',
      currency: 'JPY',
      value: 3000000,
      ukefFacilityId: '12345',
    },
    validation: { required: [] },
    createdAt: 20,
  }],
});

const MockFacilityResponseChangedIssued = {
  status: CONSTANTS.DEAL_STATUS.COMPLETED,
  items: [{
    details: {
      type: CONSTANTS.FACILITY_TYPE.CASH,
      name: 'UKEF123',
      hasBeenIssued: false,
      monthsOfCover: null,
      coverStartDate: '2022-01-02T00:00:00.000+00:00',
      shouldCoverStartOnSubmission: true,
      coverEndDate: '2030-01-02T00:00:00.000+00:00',
      currency: 'JPY',
      value: 3000000,
      ukefFacilityId: '12345',
      canResubmitIssuedFacilities: true,
    },
    validation: { required: [] },
    createdAt: 20,
  }],
};

const MockFacilityResponseNotChangedIssued = {
  status: CONSTANTS.DEAL_STATUS.COMPLETED,
  items: [{
    details: {
      type: CONSTANTS.FACILITY_TYPE.CASH,
      name: 'UKEF123',
      hasBeenIssued: false,
      monthsOfCover: null,
      coverStartDate: '2022-01-02T00:00:00.000+00:00',
      shouldCoverStartOnSubmission: true,
      coverEndDate: '2030-01-02T00:00:00.000+00:00',
      currency: 'JPY',
      value: 3000000,
      ukefFacilityId: '12345',
    },
    validation: { required: [] },
    createdAt: 20,
  }],
};

const MockApplicationResponseSubmission = () => {
  const res = {};
  res._id = '1234';
  res.exporter = {};
  res.bank = { id: 'BANKID' };
  res.bankInternalRefName = 'My test';
  res.status = CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF;
  res.eligibility = {
    criteria: [
      { id: 12, answer: null, text: 'Test' },
    ],
  };
  res.submissionType = 'Automatic Inclusion Notice';
  res.editorId = 1235;

  return res;
};

const MockSubmissionRequest = () => ({
  params: {
    dealId: '1234',
  },
  query: {},
  body: {
    comment: 'Some comments here',
  },
  session: {
    userToken: '',
    user: {
      username: 'maker',
      firstname: 'Bob',
      surname: 'Smith',
      email: 'test@test.com',
      bank: { id: 'BANKID' },
      roles: ['maker'],
      _id: 1235,
    },
  },
});

const MockResponseUnissued = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequestUnissued = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.body = {};
  req.params.dealId = '123';
  req.params.facilityId = 'xyz';
  req.params.facilityName = 'UKEF123';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
      _id: '12345',
      firstname: 'Test',
      surname: 'Test',
    },
    userToken: 'TEST',
  };
  req.success = {
    message: 'UKEF123 is updated',
  };
  req.url = '/gef/application-details/123/unissued-facilities';
  return req;
};

const MockRequestIssuedToUnissued = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.body = {};
  req.params.dealId = '123';
  req.params.facilityId = 'xyz';
  req.params.facilityName = 'UKEF123';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
      _id: '12345',
      firstname: 'Test',
      surname: 'Test',
    },
    userToken: 'TEST',
  };
  req.success = {
    message: 'UKEF123 is updated',
  };
  req.url = '/gef/application-details/123/unissued-facilities/xyz/change-to-unissued';
  return req;
};

const MockFacilityResponseUnissued = () => {
  const res = {};
  res.details = {
    type: CONSTANTS.FACILITY_TYPE.CASH,
    name: 'UKEF123',
    hasBeenIssued: true,
    monthsOfCover: 30,
    issueDate: '2022-01-05T00:00:00.000+00:00',
    coverStartDate: '2022-01-02T00:00:00.000+00:00',
    shouldCoverStartOnSubmission: true,
    coverEndDate: '2030-01-02T00:00:00.000+00:00',
  };
  return res;
};

const MockFacilityResponseSpecialIssue = () => {
  const res = {};
  res.details = {
    type: CONSTANTS.FACILITY_TYPE.CASH,
    name: 'UKEF123',
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: false,
    specialIssuePermission: true,
  };
  return res;
};

const MockExpectedFacilityRenderChange = (change) => ({
  facilityType: CONSTANTS.FACILITY_TYPE.CASH,
  facilityName: 'UKEF123',
  hasBeenIssued: true,
  monthsOfCover: '30',
  shouldCoverStartOnSubmission: 'true',
  issueDateDay: '5',
  issueDateMonth: '1',
  issueDateYear: '2022',
  coverStartDateDay: '2',
  coverStartDateMonth: '1',
  coverStartDateYear: '2022',
  coverEndDateDay: '2',
  coverEndDateMonth: '1',
  coverEndDateYear: '2030',
  facilityTypeString: 'cash',
  dealId: '123',
  facilityId: 'xyz',
  status: 'change',
  change,
});

const MockFacilitiesResponse = () => ({
  items: [
    {
      details: {
        type: CONSTANTS.FACILITY_TYPE.CASH,
        name: 'UKEF123',
        hasBeenIssued: true,
        monthsOfCover: 30,
        issueDate: '2022-01-05T00:00:00.000+00:00',
        coverStartDate: '2022-01-02T00:00:00.000+00:00',
        shouldCoverStartOnSubmission: true,
        coverEndDate: '2030-01-02T00:00:00.000+00:00',
      },
      status: CONSTANTS.DEAL_STATUS.COMPLETED,
    },
  ],
  status: CONSTANTS.DEAL_STATUS.COMPLETED,
});

module.exports = {
  MockResponse,
  MockRequest,
  MockRequestChecker,
  MockRequestUrl,
  MockRequestUrlChecker,
  MockApplicationResponseDraft,
  MockApplicationResponseSubmitted,
  MockUserResponse,
  MockUserResponseChecker,
  MockEligibilityCriteriaResponse,
  MockFacilityResponse,
  MockApplicationResponseSubmission,
  MockSubmissionRequest,
  MockResponseUnissued,
  MockRequestUnissued,
  MockRequestIssuedToUnissued,
  MockFacilityResponseUnissued,
  MockExpectedFacilityRenderChange,
  MockFacilitiesResponse,
  MockFacilityResponseSpecialIssue,
  MockFacilityResponseChangedIssued,
  MockFacilityResponseNotChangedIssued,
};
