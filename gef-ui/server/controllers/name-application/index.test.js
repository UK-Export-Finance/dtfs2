import { nameApplication, createApplication } from './index';
import * as api from '../../services/api';

const mockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const response = mockResponse();
const mockCriteria = {
  mockedText: 'This is a test',
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
    const mockedRequest = {
      body: {
        bankInternalRefName: '',
      },
    };
    api.createApplication = () => Promise.resolve(mockCriteria);
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
    };
    await createApplication(mockedRequest, response);
    expect(response.redirect).toHaveBeenCalledWith('application-details');
  });
});
