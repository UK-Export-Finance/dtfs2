/* eslint-disable no-underscore-dangle */
import { nameApplication, createApplication } from './index';
import * as api from '../../services/api';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.body = {};
  req.session = {};
  req.session.user = {};
  req.body.bankInternalRefName = '1234';
  req.session.user._id = 'abc';
  return req;
};

const mockResponse = new MockResponse();
const mockRequest = new MockRequest();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Name Application', () => {
  it('renders the `name-application` template', async () => {
    await nameApplication({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk');
  });
});

describe('Create Application', () => {
  it('returns error object if `bankInternalRefName` property is empty', async () => {
    const updatedMockedRequest = {
      ...mockRequest,
      body: {
        bankInternalRefName: '',
      },
    };
    await createApplication(updatedMockedRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', expect.objectContaining({
      errors: expect.any(Object),
    }));
  });

  it('renders the `application details` page with validation errors if valdiation fails on server', async () => {
    const mockValidationRejection = {
      status: 422,
      data: [],
    };
    api.createApplication = () => Promise.reject(mockValidationRejection);
    await createApplication(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', { errors: { errorSummary: [], fieldErrors: {} } });
  });

  it('redirects user to `application details` page if successful', async () => {
    const mockApplication = {
      _id: '123456',
      bankInternalRefName: 'Ref Name',
    };

    api.createApplication = () => Promise.resolve(mockApplication);
    await createApplication(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('application-details/123456');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.createApplication = () => Promise.reject(mockedRejection);
    await createApplication(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
