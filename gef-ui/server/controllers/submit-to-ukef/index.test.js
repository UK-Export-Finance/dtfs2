import { submitToUkef, createSubmissionToUkef } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';

const { isNotice } = require('../../utils/deal-helpers');

const { RES_MOCK_AIN_APPLICATION_CHECKER } = require('../../utils/mocks/mock_applications');
const { MOCK_ISSUED_FACILITY } = require('../../utils/mocks/mock_facilities');

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
  req.body = { comment: '' };
  req.query = {};
  req.params.dealId = '1234';
  req.session = {
    user: {
      bank: { id: '9' },
      roles: ['MAKER'],
    },
    userToken: 'TEST',
  };
  return req;
};

const mockFacilities = {
  status: CONSTANTS.DEAL_STATUS.COMPLETED,
  items: [MOCK_ISSUED_FACILITY],
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
  res.status = CONSTANTS.DEAL_STATUS.BANK_CHECK;
  res.eligibility = {
    criteria: [],
    updatedAt: 1638535562287,
    status: CONSTANTS.DEAL_STATUS.COMPLETED,
  };
  res.ukefDecisionAccepted = true;

  return res;
};

const MockMakerUserResponse = () => ({
  firstName: 'first',
  surname: 'surname',
  timezone: 'Europe/London',
});

describe('controllers/submit-to-ukef', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    const mockFacilitiesResponse = MockFacilitiesResponse();

    api.getApplication.mockResolvedValue(RES_MOCK_AIN_APPLICATION_CHECKER());
    api.getUserDetails.mockResolvedValue(MockMakerUserResponse());
    api.updateApplication.mockResolvedValue(mockApplicationResponse);
    api.setApplicationStatus.mockResolvedValue(mockApplicationResponse);
    api.getFacilities.mockResolvedValue(mockFacilitiesResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create submission to UKEF', () => {
    it('redirects to submission url', async () => {
      await createSubmissionToUkef(mockRequest, mockResponse);
      // TODO: DTFS2-4706 - add a route and redirect instead of rendering?
      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/submit-to-ukef-confirmation.njk', {
          submissionType: mockApplicationResponse.submissionType,
          status: mockApplicationResponse.status,
          isNotice: isNotice(mockApplicationResponse.submissionType),
          ukefDecisionAccepted: mockApplicationResponse.ukefDecisionAccepted,
          unissuedToIssued: true,
        });
    });

    it('renders an error when the comment is over the maximum length', async () => {
      const longComments = 'a'.repeat(401);
      mockRequest.body.comment = longComments;

      await createSubmissionToUkef(mockRequest, mockResponse);

      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/submit-to-ukef.njk', expect.objectContaining({
          dealId: expect.any(String),
          comment: longComments,
          maxCommentLength: expect.any(Number),
          errors: expect.any(Object),
        }));
    });
  });

  describe('Submit to UKEF', () => {
    it('renders the page as expected', async () => {
      await submitToUkef(mockRequest, mockResponse);

      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/submit-to-ukef.njk',
          expect.objectContaining({
            dealId: expect.any(String),
            maxCommentLength: expect.any(Number),
          }));
    });
  });
});
