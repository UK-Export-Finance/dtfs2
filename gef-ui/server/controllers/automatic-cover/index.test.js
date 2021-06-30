import { automaticCover, validateAutomaticCover } from './index';
import * as api from '../../services/api';

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.applicationId = '123';
  req.body = {};
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockCoverResponse = () => {
  const res = {};
  res.terms = [];
  return res;
};

const MockCoverTermsResponse = () => {
  const res = {};
  return res;
};


afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Automatic Cover', () => {
  it('renders the `automatic-cover` template', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockEligibilityCriteriaResponse = new MockCoverResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();

    mockEligibilityCriteriaResponse.terms.push({
      id: 'coverStart',
      htmlText: '&lt;p&gt;x. this one shouldn&#39;t show as it&#39;s an old version&lt;/p&gt',
      errMsg: 'Error message',
    });

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getEligibilityCriteria = () => Promise.resolve(mockEligibilityCriteriaResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    await automaticCover(mockRequest, mockResponse);
    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/automatic-cover.njk', {
        terms: [{
          errMsg: 'Error message',
          htmlText: '<p>x. this one shouldn\'t show as it\'s an old version</p>',
          id: 'coverStart',
        }],
        applicationId: '123',
      });
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };

    api.getEligibilityCriteria = () => Promise.reject(mockedRejection);
    await automaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Automatic Cover', () => {
  it('returns no validation errors if `save and return` is set to true', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockCoverResponse = new MockCoverResponse();
    // const mockCoverTermsResponse = new MockCoverTermsResponse();
    mockRequest.query.saveAndReturn = 'true';

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    // api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.updateCoverTerms = () => Promise.resolve();
    await validateAutomaticCover(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('renders the correct data if validation fails', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockCoverResponse = new MockCoverResponse();

    mockCoverResponse.terms.push({
      id: 'coverStart',
      htmlText: 'Some text',
      errMsg: 'Error message for some text',
    });
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/automatic-cover.njk', expect.objectContaining({
        errors: expect.any(Object),
        terms: mockCoverResponse.terms,
        selected: {},
        applicationId: '123',
      }));
  });

  it('redirects user to `ineligible-automatic-cover` page if user selects at least 1 false`', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockCoverResponse = new MockCoverResponse();

    mockRequest.body = { coverStart: 'false' };
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith(
      '/gef/application-details/123/ineligible-automatic-cover',
    );

    mockRequest.body = { coverStart: 'false', value: 'true' };
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith(
      '/gef/application-details/123/ineligible-automatic-cover',
    );
  });

  it('redirects user to `application details` page if user selects all true values`', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockCoverResponse = new MockCoverResponse();

    mockRequest.body = { coverStart: 'true', value: 'true' };
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith(
      '/gef/application-details/123/eligible-automatic-cover',
    );
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const next = jest.fn();

    const mockedRejection = { status: 400, message: 'Whoops' };

    api.getEligibilityCriteria = () => Promise.reject(mockedRejection);
    await validateAutomaticCover(mockRequest, mockResponse, next);
    expect(next).toHaveBeenCalledWith(mockedRejection);
  });
});
