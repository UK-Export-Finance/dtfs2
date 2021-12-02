import { processCoverStartDate } from './index';
import api from '../../services/api';

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

const mockExporter = {
  status: 'NOT_STARTED',
};
const MockExporterResponse = () => mockExporter;

const mockFacilities = {
  status: 'NOT_STARTED',
};

const MockFacilitiesResponse = () => mockFacilities;

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.bankInternalRefName = 'My test';
  res.comments = [{
    role: 'maker',
    userName: 'Test User',
    createdAt: '1625482095783',
    comment: 'The client needs this asap.',
  }];
  res.bankId = 'BANKID';
  res.submissionType = 'Manual Inclusion Notice';
  res.status = 'UKEF_APPROVED_WITH_CONDITIONS';
  return res;
};

const MockMakerUserResponse = () => ({
  firstName: 'first',
  surname: 'surname',
  timezone: 'Europe/London',
});

describe('controller/ukef-cover-start-date', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    const mockExporterResponse = MockExporterResponse();
    const mockFacilitiesResponse = MockFacilitiesResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getUserDetails.mockResolvedValue(MockMakerUserResponse());
    api.updateApplication.mockResolvedValue(mockApplicationResponse);
    api.setApplicationStatus.mockResolvedValue(mockApplicationResponse);
    api.getExporter.mockResolvedValue(mockExporterResponse);
    api.getFacilities.mockResolvedValue(mockFacilitiesResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Process cover start date for the facility', () => {
    it('Render the expected behaviour', async () => {
      await processCoverStartDate(mockRequest, mockResponse);
    });
  });
});
