import { nameApplication, createApplication } from './index';
import * as api from '../../services/api';

const mockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const response = mockResponse();
const mockedRequest = {
  body: {
    bankInternalRefName: '1234',
  },
  session: {
    user: {
      _id: 'abc',
    },
  },
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Name Application', () => {
  it('renders the `name-application` template', async () => {
    await nameApplication({}, response);
    expect(response.render).toHaveBeenCalledWith('partials/name-application.njk');
  });
});

describe('Create Application', () => {
  it('returns error object if `bankInternalRefName` property is empty', async () => {
    const updatedMockedRequest = {
      ...mockedRequest,
      body: {
        bankInternalRefName: '',
      },
    };
    await createApplication(updatedMockedRequest, response);
    expect(response.render).toHaveBeenCalledWith('partials/name-application.njk', expect.objectContaining({
      errors: expect.any(Object),
    }));
  });

  it('renders the `application details` page with validation errors if valdiation fails on server', async () => {
    const mockValidationResponse = {
      response: {
        status: 422,
        message: 'Validation error from server',
      },
    };
    api.createApplication = () => Promise.resolve(mockValidationResponse);
    await createApplication(mockedRequest, response);
    expect(response.render).toHaveBeenCalledWith('partials/name-application.njk');
  });

  it('redirects user to `application details` page if successful', async () => {
    const mockApplication = {
      _id: '123456',
      bankInternalRefName: 'Ref Name',
    };

    api.createApplication = () => Promise.resolve(mockApplication);
    await createApplication(mockedRequest, response);
    expect(response.redirect).toHaveBeenCalledWith('application-details/123456');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.createApplication = () => Promise.reject(mockedRejection);
    await createApplication(mockedRequest, response);
    expect(response.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
