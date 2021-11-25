import { acceptUkefDecision } from './index';
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
  req.body = { decision: true };
  req.query = {};
  req.params.applicationId = '1234';
  req.url = '/gef/application-details/1234/review-decision';
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
  res.submissionType = 'Automatic Inclusion Notice';
  res.status = 'UKEF_APPROVED_WITHOUT_CONDITIONS';
  return res;
};

const MockMakerUserResponse = () => ({
  firstName: 'first',
  surname: 'surname',
  timezone: 'Europe/London',
});

describe('controller/review-decision', () => {
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

  describe('Accept UKEF Decision', () => {
    it('renders the page as expected', async () => {
      await acceptUkefDecision(mockRequest, mockResponse);

      expect(mockResponse.redirect)
        .toHaveBeenCalledWith('/gef/application-details/1234/confirm-cover-start-date');
    });
  });
});
