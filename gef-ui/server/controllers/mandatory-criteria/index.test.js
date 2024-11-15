import { getMandatoryCriteria, validateMandatoryCriteria } from './index';
import api from '../../services/api';

jest.mock('../../services/api');

const MockRequest = () => {
  const req = {};
  req.body = {};
  req.session = { userToken: 'test-token' };
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockCriteriaResponse = () => {
  const res = {};
  res.text = 'This is a test';
  return res;
};

describe('controllers/mandatory-criteria', () => {
  let mockResponse;
  let mockRequest;
  let mockCriteriaResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockCriteriaResponse = MockCriteriaResponse();

    api.getMandatoryCriteria.mockResolvedValue(mockCriteriaResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Mandatory Criteria', () => {
    it('renders the `mandatory-criteria` template', async () => {
      await getMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('_partials/mandatory-criteria.njk', {
        criteria: mockCriteriaResponse,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with the api', async () => {
      api.getMandatoryCriteria.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });
      await getMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('Validate Mandatory Criteria', () => {
    it('returns error object if mandatory criteria property is empty', async () => {
      mockRequest.body.mandatoryCriteria = '';

      await validateMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith(
        '_partials/mandatory-criteria.njk',
        expect.objectContaining({
          criteria: expect.any(Object),
          errors: expect.any(Object),
        }),
      );
    });

    it('redirects user to `name application` page if they select `true`', async () => {
      mockRequest.body.mandatoryCriteria = 'true';

      await validateMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('name-application');
    });

    it('redirects user to `ineligible gef` page if they select `false`', async () => {
      mockRequest.body.mandatoryCriteria = 'false';
      await validateMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/ineligible-gef');
    });

    it('redirects user to `problem with service` page if there is an issue with the api', async () => {
      mockRequest.body.mandatoryCriteria = '';
      api.getMandatoryCriteria.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await validateMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });
});
