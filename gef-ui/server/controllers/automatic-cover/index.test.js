import { automaticCover, validateAutomaticCover } from './index';
import * as api from '../../services/api';

const MockRequest = () => {
  const req = {};
  req.params = {};
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

const mockRequest = new MockRequest();
const mockResponse = new MockResponse();
const mockCoverResponse = new MockCoverResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Automatic Cover', () => {
  it('renders the `automatic-cover` template', async () => {
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await automaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/automatic-cover.njk', {
      terms: expect.any(Array),
      applicationId: '123',
    });
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getEligibilityCriteria = () => Promise.reject(mockedRejection);
    await automaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Automatic Cover', () => {
  it('renders the correct data if validation fails', async () => {
    mockCoverResponse.terms.push({
      id: 'coverStart',
      htmlText: 'Some text',
      errMsg: 'Error message for some text',
    });
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/automatic-cover.njk', expect.objectContaining({
      errors: expect.any(Object),
      terms: mockCoverResponse.terms,
      selected: {},
      applicationId: '123',
    }));
  });

  it('redirects user to `ineligible-automatic-cover` page if user selects at least 1 false`', async () => {
    mockRequest.body = { coverStart: 'false' };
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('ineligible-automatic-cover');

    mockRequest.body = { coverStart: 'false', value: 'true' };
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('ineligible-automatic-cover');
  });

  it('redirects user to `application details` page if user selects all true values`', async () => {
    mockRequest.body = { coverStart: 'true', value: 'true' };
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getEligibilityCriteria = () => Promise.reject(mockedRejection);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
