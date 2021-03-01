import { getMandatoryCriteria, validateMandatoryCriteria } from './index';
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

describe('GET Mandatory Criteria', () => {
  it('renders the `mandatory-criteria` template', async () => {
    api.getMandatoryCriteria = () => Promise.resolve(mockCriteria);
    await getMandatoryCriteria({}, response);
    expect(response.render).toHaveBeenCalledWith('partials/mandatory-criteria.njk', {
      criteria: mockCriteria,
    });
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getMandatoryCriteria = () => Promise.reject(mockedRejection);
    await getMandatoryCriteria({}, response);
    expect(response.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Mandatory Criteria', () => {
  it('returns error object if mandatory criteria property is empty', async () => {
    const mockedRequest = {
      body: {
        mandatoryCriteria: '',
      },
    };
    api.getMandatoryCriteria = () => Promise.resolve(mockCriteria);
    await validateMandatoryCriteria(mockedRequest, response);
    expect(response.render).toHaveBeenCalledWith('partials/mandatory-criteria.njk', expect.objectContaining({
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
    api.getMandatoryCriteria = () => Promise.resolve(mockCriteria);
    await validateMandatoryCriteria(mockedRequest, response);
    expect(response.redirect).toHaveBeenCalledWith('name-application');
  });

  it('redirects user to `ineligible` page if they select `false`', async () => {
    const mockedRequest = {
      body: {
        mandatoryCriteria: 'false',
      },
    };
    await validateMandatoryCriteria(mockedRequest, response);
    expect(response.redirect).toHaveBeenCalledWith('ineligible');
  });
});
