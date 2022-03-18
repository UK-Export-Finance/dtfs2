import { acceptUkefDecision } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';

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
  req.params.dealId = '1234';
  req.url = '/gef/application-details/1234/review-decision';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
      _id: '12345',
    },
    userToken: 'TEST',
  };
  return req;
};

const mockFacilities = {
  status: CONSTANTS.DEAL_STATUS.NOT_STARTED,
  items: [
    {
      details: {
        _id: '1234',
        ukefFacilityId: '123',
        dealId: '12345',
        name: 'Test',
        value: 1000,
        hasBeenIssued: true,
        coverDateConfirmed: false,
        currency: {
          id: 123,
        },
      },
    },
  ],
};

const MockFacilitiesResponse = () => mockFacilities;

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporter = {};
  res.bankInternalRefName = 'My test';
  res.comments = [{
    role: 'maker',
    userName: 'Test User',
    createdAt: '1625482095783',
    comment: 'The client needs this asap.',
  }];
  res.bank = { id: 'BANKID' };
  res.submissionType = 'Automatic Inclusion Notice';
  res.status = CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
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
  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    const mockFacilitiesResponse = MockFacilitiesResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getUserDetails.mockResolvedValue(MockMakerUserResponse());
    api.updateApplication.mockResolvedValue(mockApplicationResponse);
    api.updateApplication = updateApplicationSpy;
    api.getFacilities.mockResolvedValue(mockFacilitiesResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Accept UKEF Decision', () => {
    it('renders the page as expected', async () => {
      await acceptUkefDecision(mockRequest, mockResponse);

      expect(mockResponse.redirect)
        .toHaveBeenCalledWith('/gef/application-details/1234/cover-start-date');
    });

    it('calls api.updateApplication with editorId', async () => {
      await acceptUkefDecision(mockRequest, mockResponse);

      expect(updateApplicationSpy).toHaveBeenCalledWith(mockRequest.params.dealId, expect.objectContaining({ editorId: '12345' }));
    });
  });
});
