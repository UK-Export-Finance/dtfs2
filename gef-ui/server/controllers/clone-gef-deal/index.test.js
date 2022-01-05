import { cloneDealCreateApplication, cloneDealValidateMandatoryCriteria, cloneDealNameApplication } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');

const MockApplicationResponse = () => ({
  _id: '1234',
  exporter: {},
  bank: { id: 'BANKID' },
  bankInternalRefName: 'Cloned deal',
  additionalRefName: 'additional',
  status: CONSTANTS.DEAL_STATUS.DRAFT,
  maker: { name: 'mock-user' },
  supportingInformation: {
    status: CONSTANTS.DEAL_STATUS.NOT_STARTED,
  },
});

const MockRequestMandatoryCriteria = () => ({ body: {} });
const MockResponseMandatoryCriteria = () => ({ text: 'This is a test' });

const MockResponse = () => ({
  redirect: jest.fn(),
  render: jest.fn(),
});

describe('clone-gef-deal/mandatory-criteria', () => {
  let mockResponse;
  let mockRequest;
  let mockCriteriaResponse;
  let mockApplicationResponse;
  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequestMandatoryCriteria();

    mockCriteriaResponse = MockResponseMandatoryCriteria();
    mockApplicationResponse = MockApplicationResponse();

    api.getMandatoryCriteria.mockResolvedValue(mockCriteriaResponse);
    api.getApplication.mockResolvedValue(mockApplicationResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validate Mandatory Criteria', () => {
    it('returns error object if mandatory criteria property is empty', async () => {
      mockRequest.body.mandatoryCriteria = '';

      await cloneDealValidateMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/mandatory-criteria.njk', expect.objectContaining({
        criteria: expect.any(Object),
        errors: expect.any(Object),
      }));
    });

    it('redirects user to `name application` page if they select `true`', async () => {
      mockRequest.body.mandatoryCriteria = 'true';

      await cloneDealValidateMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('clone/name-application');
    });

    it('redirects user to `ineligible gef` page if they select `false`', async () => {
      mockRequest.body.mandatoryCriteria = 'false';
      await cloneDealValidateMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/ineligible-gef');
    });

    it('redirects user to `problem with service` page if there is an issue with the api', async () => {
      mockRequest.body.mandatoryCriteria = '';
      api.getMandatoryCriteria.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await cloneDealValidateMandatoryCriteria(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});

describe('clone-gef-deal/name-application', () => {
  const MockPostRequest = () => {
    const req = {};
    req.body = { bankInternalRefName: 'Cloned deal' };
    req.session = {};
    req.session.user = {
      _id: 'abc',
      bank: { id: 'mock-bank' },
    };
    req.params = { id: '1234', dealId: '1234' };
    return req;
  };
  const MockRequestWithIdParam = () => {
    const req = {};
    req.params = { id: '1234' };
    return req;
  };

  let mockRequestWithIdParam;
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockRequestWithIdParam = MockRequestWithIdParam();
    mockResponse = MockResponse();
    mockRequest = MockPostRequest();
    mockApplicationResponse = MockApplicationResponse();
    api.getApplication.mockResolvedValue(mockApplicationResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the `name-application` template when no application id is passed', async () => {
    await cloneDealNameApplication({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', { cloneDeal: true, dealName: 'Cloned deal' });
  });

  it('calls the appropriate api and renders the `name-application` template with correct data', async () => {
    await cloneDealNameApplication(mockRequestWithIdParam, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', {
      cloneDeal: true,
      dealName: 'Cloned deal',
    });
  });

  it('renders the `application details` page with validation errors if validation fails on server', async () => {
    const mockNext = jest.fn();
    api.cloneApplication = jest.fn();
    api.cloneApplication.mockResolvedValueOnce({ status: 422, data: [] });

    await cloneDealCreateApplication(mockRequest, mockResponse, mockNext);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', { bankInternalRefName: mockRequest.body.bankInternalRefName, additionalRefName: undefined, errors: { errorSummary: [], fieldErrors: {} } });
  });

  it('redirects user to dashboard page', async () => {
    const mockNext = jest.fn();
    api.cloneApplication = jest.fn();
    api.cloneApplication.mockResolvedValueOnce({
      _id: '123456',
      dealId: '123456',
      bankInternalRefName: 'Cloned deal',
    });

    const resp = await cloneDealCreateApplication(mockRequest, mockResponse, mockNext);
    expect(resp).toBeUndefined();
  });

  it('shows user generic error page if there is an issue with the API', async () => {
    const mockNext = jest.fn();
    api.cloneApplication = jest.fn();

    api.cloneApplication.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });
    await cloneDealCreateApplication(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
