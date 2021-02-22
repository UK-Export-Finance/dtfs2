import { nameApplication, createApplication } from './index';
import * as api from '../../services/api';

const mockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const response = mockResponse();

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
    const mockedRequest = {
      body: {
        bankInternalRefName: '',
      },
      session: {
        user: {
          _id: 'abc',
        },
      },
    };
    await createApplication(mockedRequest, response);
    expect(response.render).toHaveBeenCalledWith('partials/name-application.njk', expect.objectContaining({
      errors: expect.any(Object),
    }));
  });

  it('redirects user to `application details` page if successful', async () => {
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
    const mockApplication = {
      _id: '123456',
      bankInternalRefName: 'Ref Name',
    };

    api.createApplication = () => Promise.resolve(mockApplication);
    await createApplication(mockedRequest, response);
    expect(response.redirect).toHaveBeenCalledWith('application-details/123456');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
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

    api.createApplication = () => Promise.reject();
    await createApplication(mockedRequest, response);
    expect(response.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
