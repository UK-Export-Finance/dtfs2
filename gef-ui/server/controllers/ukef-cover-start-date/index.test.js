import { processCoverStartDate } from './index';
import api from '../../services/api';

const Chance = require('chance');

const chance = new Chance();

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.body = {
    ukefCoverStartDate: true,
    day: 1,
    month: 12,
    year: 2021,
  };
  req.query = {};
  req.params.applicationId = '1234';
  req.params.facilityId = '4321';
  req.success = {
    message: 'Cover start date for 4321 confirmed',
  };
  req.url = '/gef/application-details/1234/confirm-cover-start-date';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
    },
    userToken: 'TEST',
  };
  return req;
};

const MockApplicationResponse = () => {
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
    status: 'IN_PROGRESS',
  };
  res.editedBy = ['MAKER_CHECKER'];
  res.submissionType = 'Automatic Inclusion Application';
  res.submissionCount = 0;
  res.comments = [];
  res.ukefDealId = null;
  res.createdAt = chance.timestamp();
  res.submissionDate = chance.timestamp();
  return res;
};

const MockUserResponse = () => ({
  username: 'maker',
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

describe('controller/ukef-cover-start-date', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockExporterResponse;
  let mockFacilityResponse;
  let mockUserResponse;
  let mockEligibilityCriteriaResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();
    mockExporterResponse = MockExporterResponse();
    mockFacilityResponse = MockFacilityResponse();
    mockUserResponse = MockUserResponse();
    mockEligibilityCriteriaResponse = MockEligibilityCriteriaResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getExporter.mockResolvedValue(mockExporterResponse);
    api.getFacilities.mockResolvedValue(mockFacilityResponse);
    api.getEligibilityCriteria.mockResolvedValue(mockEligibilityCriteriaResponse);
    api.getUserDetails.mockResolvedValue(mockUserResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Process cover start date for the facility', () => {
    it('Render the expected behaviour', async () => {
      await processCoverStartDate(mockRequest, mockResponse);
      expect(mockResponse.redirect)
        .toHaveBeenCalledWith('/gef/application-details/1234/confirm-cover-start-date');
    });
  });
});
