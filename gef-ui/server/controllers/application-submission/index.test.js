import {
  getApplicationSubmission,
  postApplicationSubmission,
} from './index';
import api from '../../services/api';
import { PROGRESS } from '../../../constants';

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
  req.query = {};
  req.params.applicationId = '1234';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
    },
  };
  return req;
};

const MockSubmissionRequest = () => ({
  params: {
    applicationId: '1234',
  },
  query: {},
  body: {
    comment: 'Some comments here',
  },
  session: {
    userToken: '',
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
      _id: 1235,
    },
  },
});

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.bankId = 'BANKID';
  res.bankInternalRefName = 'My test';
  res.eligibility = {
    isAutomaticCover: true,
    criteria: [
      { id: 12, answer: null, text: 'Test' },
    ],
  };
  res.submissionType = 'Automatic Inclusion Notice';
  res.editorId = 1235;

  return res;
};

const MockUserResponse = () => ({
  username: 'maker',
  bank: { id: 'BANKID' },
});

const MockExporterResponse = () => {
  const res = {};
  res.details = {};
  res.status = 'IN_PROGRESS';
  res.validation = {};
  res.details.companiesHouseRegistrationNumber = 'tedsi';
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
  res.items = [];
  res.details = {
    type: 'CASH',
    name: 'Foundry4',
    hasBeenIssued: true,
    monthsOfCover: null,
    coverStartDate: '2022-01-02T00:00:00.000+00:00',
    shouldCoverStartOnSubmission: true,
    changedToIssued: true,
    coverEndDate: '2030-01-02T00:00:00.000+00:00',
  };
  return res;
};

describe('controllers/application-submission', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getExporter.mockResolvedValue(MockExporterResponse());
    api.getFacilities.mockResolvedValue(MockFacilityResponse());
    api.getEligibilityCriteria.mockResolvedValue(MockEligibilityCriteriaResponse());
    api.getUserDetails.mockResolvedValue(MockUserResponse());
    api.updateApplication.mockResolvedValue({});
    api.setApplicationStatus.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Application Submission', () => {
    it('renders submission page as expected', async () => {
      await getApplicationSubmission(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('application-details-comments.njk', expect.objectContaining({
        applicationId: expect.any(String),
        submissionType: expect.any(String),
        maxCommentLength: expect.any(Number),
        isAutomaticCover: expect.any(String),
      }));
    });
  });

  describe('POST Application Submission', () => {
    beforeEach(() => {
      mockRequest = MockSubmissionRequest();
    });

    it('renders confirmation if successfully submitted', async () => {
      await postApplicationSubmission(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('application-details-submitted.njk', expect.objectContaining({
        applicationId: expect.any(String),
        submissionType: expect.any(String),
        unissuedToIssued: expect.any(Boolean),
      }));
    });

    it('renders error where comments are too long', async () => {
      const longComments = 'a'.repeat(410);
      mockRequest.body.comment = longComments;

      await postApplicationSubmission(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('application-details-comments.njk', expect.objectContaining({
        applicationId: expect.any(String),
        comment: longComments,
        maxCommentLength: expect.any(Number),
        errors: expect.any(Object),
      }));
    });

    it('adds a comment to the application when the user enters one', async () => {
      mockRequest.body.comment = 'Some comments here';
      api.updateApplication = jest.fn();

      const expected = {
        ...{
          comments: [{
            role: 'maker', userName: 'maker', createdAt: expect.any(Number), comment: mockRequest.body.comment,
          }],
          editorId: 1235,
        },
      };

      await postApplicationSubmission(mockRequest, mockResponse);

      expect(api.updateApplication).toHaveBeenCalledWith(mockApplicationResponse._id, expected);
    });

    it('doesnt add a comment to the application when the user doesnt enter one', async () => {
      api.updateApplication = jest.fn();
      mockRequest.body.comment = '';

      await postApplicationSubmission(mockRequest, mockResponse);

      expect(api.updateApplication).toHaveReturnedWith(undefined);
    });

    it('updates the application status to `BANK_CHECK`', async () => {
      api.setApplicationStatus = jest.fn();
      mockRequest.body.comment = '';

      await postApplicationSubmission(mockRequest, mockResponse);

      expect(api.setApplicationStatus).toHaveBeenCalledWith(mockApplicationResponse._id, PROGRESS.BANK_CHECK);
    });
  });
});
