import { getMandatoryCriteria, validateMandatoryCriteria } from './index';
import * as api from '../../services/api';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockCriteriaResponse = () => {
  const res = {};
  res.htmlText = 'This is a test';
  return res;
};

const mockResponse = new MockResponse();
const mockCriteriaResponse = new MockCriteriaResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Mandatory Criteria', () => {
  it('renders the `mandatory-criteria` template', async () => {
    api.getMandatoryCriteria = () => Promise.resolve(mockCriteriaResponse);
    await getMandatoryCriteria({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/mandatory-criteria.njk', {
      criteria: mockCriteriaResponse,
    });
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getMandatoryCriteria = () => Promise.reject(mockedRejection);
    await getMandatoryCriteria({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Mandatory Criteria', () => {
  it('returns error object if mandatory criteria property is empty', async () => {
    const mockedRequest = {
      body: {
        mandatoryCriteria: '',
      },
    };
    api.getMandatoryCriteria = () => Promise.resolve(mockCriteriaResponse);
    await validateMandatoryCriteria(mockedRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/mandatory-criteria.njk', expect.objectContaining({
      criteria: expect.any(Object),
      errors: expect.any(Object),
    }));
  });

  it('redirects user to `name application` page if they select `true`', async () => {
    const mockedRequest = {
      body: {
        mandatoryCriteria: 'true',
      },
    };
    api.getMandatoryCriteria = () => Promise.resolve(mockCriteriaResponse);
    await validateMandatoryCriteria(mockedRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('name-application');
  });

  it('redirects user to `ineligible` page if they select `false`', async () => {
    const mockedRequest = {
      body: {
        mandatoryCriteria: 'false',
      },
    };
    await validateMandatoryCriteria(mockedRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('ineligible');
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockedRequest = {
      body: {
        mandatoryCriteria: '',
      },
    };
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getMandatoryCriteria = () => Promise.reject(mockedRejection);
    await validateMandatoryCriteria(mockedRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
