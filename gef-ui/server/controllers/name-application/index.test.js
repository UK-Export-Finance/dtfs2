import { nameApplication, createApplication } from './index';
import api from '../../services/api';

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.body = { bankInternalRefName: '1234' };
  req.session = {};
  req.session.user = {
    _id: 'abc',
    bank: { id: 'mock-bank' },
  };
  return req;
};

describe('controllers/name-application', () => {
  let mockResponse;
  let mockRequest;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Name Application', () => {
    it('renders the `name-application` template', async () => {
      await nameApplication({}, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk');
    });
  });

  describe('Create Application', () => {
    it('renders the `application details` page with validation errors if validation fails on server', async () => {
      api.createApplication.mockResolvedValueOnce({
        status: 422,
        data: [],
      });

      await createApplication(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', { errors: { errorSummary: [], fieldErrors: {} } });
    });

    it('redirects user to `application details` page if successful', async () => {
      api.createApplication.mockResolvedValueOnce({
        _id: '123456',
        bankInternalRefName: 'Ref Name',
      });

      await createApplication(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('application-details/123456');
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      api.createApplication.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await createApplication(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
