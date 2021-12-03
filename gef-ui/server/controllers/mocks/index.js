const Chance = require('chance');

const chance = new Chance();

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.applicationId = '123';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
      _id: 1235,
    },
    userToken: 'TEST',
  };
  return req;
};

const MockRequestChecker = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.applicationId = '123';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['CHECKER'],
      _id: 1235,
    },
    userToken: 'TEST',
  };
  return req;
};

const MockRequestUrl = (url) => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.applicationId = '123';
  req.url = url;
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
      _id: 1235,
    },
    userToken: 'TEST',
  };
  return req;
};

const MockRequestUrlChecker = (url) => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.applicationId = '123';
  req.url = url;
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['CHECKER'],
      _id: 1235,
    },
    userToken: 'TEST',
  };
  return req;
};

const MockApplicationResponseDraft = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.bankId = 'BANKID';
  res.bankInternalRefName = 'Internal refernce';
  res.additionalRefName = 'Additional reference';
  res.status = 'DRAFT';
  res.userId = 'mock-user';
  res.supportingInformation = {
    status: 'NOT_STARTED',
  };
  res.eligibility = {
    criteria: [
      { id: 12, answer: null, text: 'Test' },
    ],
  };
  res.editedBy = ['MAKER_CHECKER'];
  res.submissionType = 'Automatic Inclusion Application';
  res.submissionCount = 0;
  res.comments = [];
  res.ukefDealId = null;
  res.createdAt = chance.timestamp();
  res.submissionDate = chance.timestamp();
  //   res.portalActivities = [];
  return res;
};

const MockApplicationResponseSubmitted = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.bankId = 'BANKID';
  res.bankInternalRefName = 'Internal refernce';
  res.additionalRefName = 'Additional reference';
  res.status = 'UKEF_IN_PROGRESS';
  res.userId = 'mock-user';
  res.checkerId = 1235;
  res.supportingInformation = {
    status: 'NOT_STARTED',
  };
  res.eligibility = {
    criteria: [
      { id: 12, answer: null, text: 'Test' },
    ],
  };
  res.editedBy = ['MAKER_CHECKER'];
  res.submissionType = 'Automatic Inclusion Notice';
  res.submissionCount = 1;
  res.comments = [];
  res.ukefDealId = 123456;
  res.createdAt = chance.timestamp();
  res.submissionDate = chance.timestamp();
  res.portalActivities = [{
    type: 'NOTICE',
    timestamp: chance.timestamp(),
    author: {
      firstName: 'Joe',
      lastName: 'Bloggs',
      id: 1235,
    },
    text: '',
    label: 'Automatic inclusion notice submitted to UKEF',
  }];
  return res;
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

const MockExporterResponse = () => {
  const res = {};
  res.details = {};
  res.status = 'IN_PROGRESS';
  res.validation = {};
  res.details.companiesHouseRegistrationNumber = 'tedsi';
  res.details.companyName = 'Test Company';
  res.validation.required = [];
  return res;
};

const MockEligibilityCriteriaResponse = () => ({
  terms: [
    {
      id: 12,
      text: 'Some eligibility criteria',
      errMsg: '12. Select some eligibility',
    },
  ],
});

const MockFacilityResponse = () => {
  const res = {};
  res.status = 'IN_PROGRESS';
  res.data = [];
  res.items = [{
    details: { type: 'CASH' },
    validation: { required: [] },
    createdAt: 20,
  }];
  return res;
};

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
  MockExporterResponse,
  MockEligibilityCriteriaResponse,
  MockFacilityResponse,
};
