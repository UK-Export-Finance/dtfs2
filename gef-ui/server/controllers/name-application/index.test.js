import { nameApplication, createApplication, updateApplicationReferences } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockPostRequest = () => {
  const req = {};
  req.body = { bankInternalRefName: '1234' };
  req.session = {};
  req.session.user = {
    _id: 'abc',
    bank: { id: 'mock-bank' },
  };
  req.params = { dealId: '1234' };
  return req;
};
const MockRequestWithIdParam = () => {
  const req = {};
  req.params = { dealId: '1234' };
  return req;
};
const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporter = {};
  res.bank = {};
  res.bankInternalRefName = 'My test';
  res.additionalRefName = 'additional';
  res.status = CONSTANTS.DEAL_STATUS.DRAFT;
  res.userId = 'mock-user';
  res.supportingInformation = {
    status: CONSTANTS.DEAL_STATUS.NOT_STARTED,
  };
  return res;
};

describe('controllers/name-application', () => {
  describe('GET Name Application', () => {
    let mockRequestWithIdParam;
    let mockResponse;
    let mockApplicationResponse;

    beforeEach(() => {
      mockRequestWithIdParam = MockRequestWithIdParam();
      mockResponse = MockResponse();
      mockApplicationResponse = MockApplicationResponse();
      api.getApplication.mockResolvedValue(mockApplicationResponse);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('renders the `name-application` template when no application id is passed', async () => {
      await nameApplication({}, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', {});
    });

    it('calls the appropriate api and renders the `name-application` template with correct data', async () => {
      await nameApplication(mockRequestWithIdParam, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', {
        bankInternalRefName: mockApplicationResponse.bankInternalRefName,
        additionalRefName: mockApplicationResponse.additionalRefName,
      });
    });
  });

  describe('Create Application', () => {
    let mockResponse;
    let mockRequest;

    beforeEach(() => {
      mockResponse = MockResponse();
      mockRequest = MockPostRequest();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('renders the `application details` page with validation errors if validation fails on server', async () => {
      api.createApplication.mockResolvedValueOnce({
        status: 422,
        data: [],
      });

      await createApplication(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', { bankInternalRefName: mockRequest.body.bankInternalRefName, additionalRefName: undefined, errors: { errorSummary: [], fieldErrors: {} } });
    });

    it('redirects user to `application details` page if successful', async () => {
      api.createApplication.mockResolvedValueOnce({
        _id: '123456',
        bankInternalRefName: 'Ref Name',
      });

      await createApplication(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123456');
    });

    it('shows user generic error page if there is an issue with the API', async () => {
      const mockNext = jest.fn();

      api.createApplication.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await createApplication(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Update Application References', () => {
    let mockResponse;
    let mockRequest;

    beforeEach(() => {
      mockResponse = MockResponse();
      mockRequest = MockPostRequest();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('renders the `application details` page with validation errors if validation fails on server', async () => {
      api.updateApplication.mockResolvedValueOnce({
        status: 422,
        data: [],
      });

      await updateApplicationReferences(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', { bankInternalRefName: mockRequest.body.bankInternalRefName, additionalRefName: '', errors: { errorSummary: [], fieldErrors: {} } });
    });

    it('redirects user to `application details` page if successful', async () => {
      api.updateApplication.mockResolvedValueOnce({
        _id: '123456',
        bankInternalRefName: 'Ref Name',
      });

      await updateApplicationReferences(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123456');
    });

    it('shows user generic error page if there is an issue with the API', async () => {
      const mockNext = jest.fn();

      api.createApplication.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await updateApplicationReferences(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
