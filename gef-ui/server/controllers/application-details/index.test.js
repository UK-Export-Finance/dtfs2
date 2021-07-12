import {
  applicationDetails,
  postApplicationDetails,
  getApplicationSubmission,
  postApplicationSubmission,
} from './index';
import * as api from '../../services/api';

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
  return req;
};

const MockSubmissionRequest = () => ({
  params: {
    applicationId: '123',
  },
  query: {},
  body: {
    comment: 'Some comments here',
  },
  session: {
    userToken: '',
  },
});

const MockApplicationResponse = () => {
  const res = {};
  res.exporterId = '123';
  res.coverTermsId = '123';
  res.bankInternalRefName = 'My test';
  return res;
};

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
  res.status = 'NOT_STARTED';
  res.details = {};
  res.validation = {};
  res.validation.required = [];
  res.data = [];
  return res;
};

const MockFacilityResponse = () => {
  const res = {};
  res.status = 'IN_PROGRESS';
  res.data = [];
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Application Details', () => {
  it('renders the `Application Details` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();
    const mockFacilityResponse = new MockFacilityResponse();

    mockFacilityResponse.items = [{ details: { type: 'CASH' }, validation: { required: [] } }];
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    await applicationDetails(mockRequest, mockResponse);
    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
        bankInternalRefName: 'My test',
        exporter: {
          status: expect.any(Object),
          rows: expect.any(Array),
        },
        coverTerms: {
          status: expect.any(Object),
          rows: expect.any(Array),
        },
        facilities: {
          status: expect.any(Object),
          data: expect.any(Array),
        },
        submit: expect.any(Boolean),
      }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getApplication = () => Promise.reject();
    await applicationDetails(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('POST Application Details', () => {
  const mockResponse = new MockResponse();
  const mockRequest = new MockRequest();

  it('redirects to submission url', async () => {
    postApplicationDetails(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/submit');
  });
});

describe('GET Application Submission', () => {
  it('renders submission page as expected', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    getApplicationSubmission(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('application-details-comments.njk', expect.objectContaining({
      applicationId: expect.any(String),
      maxCommentLength: expect.any(Number),
    }));
  });
});

describe('POST Application Submission', () => {
  const mockResponse = new MockResponse();
  const mockRequest = new MockSubmissionRequest();
  const mockApplicationResponse = new MockApplicationResponse();


  it('renders confirmation if successfully submitted', async () => {
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.updateApplication = () => Promise.resolve(mockApplicationResponse);

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('application-details-submitted.njk', expect.objectContaining({
      applicationId: expect.any(String),
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
});
