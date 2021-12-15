const Chance = require('chance');

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
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
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
      roles: ['CHECKER'],
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
      roles: ['MAKER'],
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
      roles: ['CHECKER'],
      _id: 1235,
    },
    userToken: 'TEST',
  },
});

const MockApplicationResponseDraft = () => ({
  _id: '1234',
  exporter: {},
  bankId: 'BANKID',
  bankInternalRefName: 'Internal reference',
  additionalRefName: 'Additional reference',
  status: 'DRAFT',
  userId: 'mock-user',
  supportingInformation: {
    status: 'NOT_STARTED',
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
  submissionDate: chance.timestamp(),
});

const MockApplicationResponseSubmitted = () => ({
  _id: '1234',
  exporter: {},
  bankId: 'BANKID',
  bankInternalRefName: 'Internal reference',
  additionalRefName: 'Additional reference',
  status: 'UKEF_IN_PROGRESS',
  userId: 'mock-user',
  checkerId: 1235,
  supportingInformation: {
    status: 'NOT_STARTED',
  },
  eligibility: {
    criteria: [
      { id: 12, answer: null, text: 'Test' },
    ],
  },
  editedBy: ['MAKER_CHECKER'],
  submissionType: 'Automatic Inclusion Notice',
  submissionCount: 1,
  comments: [],
  ukefDealId: 123456,
  createdAt: chance.timestamp(),
  submissionDate: chance.timestamp(),
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
});

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
  terms: [
    {
      id: 12,
      text: 'Some eligibility criteria',
      errMsg: '12. Select some eligibility',
    },
  ],
});

const MockFacilityResponse = () => ({
  status: 'IN_PROGRESS',
  data: [],
  items: [{
    details: { type: 'CASH' },
    validation: { required: [] },
    createdAt: 20,
  }],
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
};
