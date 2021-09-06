import {
  getApplicationSubmission,
  postApplicationSubmission,
} from './index';
import * as api from '../../services/api';
import { PROGRESS } from '../../../constants';

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
    },
  },
});

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.coverTermsId = '123';
  res.bankId = 'BANKID';
  res.bankInternalRefName = 'My test';
  res.coverTerms = {
    isAutomaticCover: true,
  };
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

const MockCoverTermsResponse = () => {
  const res = {};
  res.status = 'COMPLETE';
  res.details = {};
  res.validation = {};
  res.validation.required = [];
  res.isAutomaticCover = true;
  res.data = [];
  return res;
};

const MockEligibilityCriteriaResponse = () => ({
  terms: [
    {
      id: 'coverStart',
      htmlText: '<p>Some eligibility criteria</p>',
      errMsg: '12. Select some eligibilty',
    },
  ],
});

const MockFacilityResponse = () => {
  const res = {};
  res.status = 'IN_PROGRESS';
  res.data = [];
  return res;
};

describe('GET Application Submission', () => {
  let mockResponse; let mockRequest; let mockApplicationResponse;
  let mockExporterResponse; let mockCoverTermsResponse; let mockFacilityResponse;
  let mockEligibiltyCriteriaResponse;

  beforeEach(() => {
    mockResponse = new MockResponse();
    mockRequest = new MockRequest();
    mockApplicationResponse = new MockApplicationResponse();
    mockExporterResponse = new MockExporterResponse();
    mockCoverTermsResponse = new MockCoverTermsResponse();
    mockFacilityResponse = new MockFacilityResponse();
    mockEligibiltyCriteriaResponse = new MockEligibilityCriteriaResponse();

    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    api.getEligibilityCriteria = () => Promise.resolve(mockEligibiltyCriteriaResponse);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders submission page as expected', async () => {
    await getApplicationSubmission(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('application-details-comments.njk', expect.objectContaining({
      applicationId: expect.any(String),
      isAutomaticCover: expect.any(Boolean),
      maxCommentLength: expect.any(Number),
    }));
  });
});

describe('POST Application Submission', () => {
  let mockApplicationResponse; let mockResponse; let mockRequest; let mockUserResponse;
  let mockExporterResponse; let mockCoverTermsResponse; let mockFacilityResponse;
  let mockEligibiltyCriteriaResponse;

  beforeEach(() => {
    mockApplicationResponse = new MockApplicationResponse();
    mockResponse = new MockResponse();
    mockRequest = new MockSubmissionRequest();
    mockUserResponse = new MockUserResponse();
    mockExporterResponse = new MockExporterResponse();
    mockCoverTermsResponse = new MockCoverTermsResponse();
    mockFacilityResponse = new MockFacilityResponse();
    mockEligibiltyCriteriaResponse = new MockEligibilityCriteriaResponse();
    mockUserResponse = new MockUserResponse();
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    api.getEligibilityCriteria = () => Promise.resolve(mockEligibiltyCriteriaResponse);
    api.getUserDetails = () => Promise.resolve(mockUserResponse);
    api.updateApplication = () => Promise.resolve({});
    api.setApplicationStatus = () => Promise.resolve({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders confirmation if successfully submitted', async () => {
    await postApplicationSubmission(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('application-details-submitted.njk', expect.objectContaining({
      applicationId: expect.any(String),
      isAutomaticCover: expect.any(Boolean),
    }));
  });

  it('renders error where comments are too long', async () => {
    const longComments = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at ante nec magna fringilla dapibus. Praesent porta nibh at metus venenatis feugiat. Proin vel sollicitudin ligula. Nulla sed massa quis augue bibendum lacinia vitae id leo. Aliquam quis imperdiet felis, et tempus eros. Duis efficitur odio nisl, non finibus urna convallis sit amet. Cras tortor odio, finibus in fermentum vel, posuere quis.';
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
      },
    };

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(api.updateApplication).toHaveBeenCalledWith(mockApplicationResponse._id, expected);
  });

  it('doesnt add a comment to the application when the user doesnt enter one', async () => {
    api.updateApplication = jest.fn();
    mockRequest.body.comment = '';

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(api.updateApplication).not.toHaveBeenCalled();
  });

  it('updates the application status to `BANK_CHECK`', async () => {
    api.setApplicationStatus = jest.fn();
    mockRequest.body.comment = '';

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(api.setApplicationStatus).toHaveBeenCalledWith(mockApplicationResponse._id, PROGRESS.BANK_CHECK);
  });
});
