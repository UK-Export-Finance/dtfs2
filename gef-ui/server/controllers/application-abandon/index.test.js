import {
  confirmAbandonApplication,
  abandonApplication,
} from './index';
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
  req.params = {};
  req.query = {};
  req.params.applicationId = '123';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
    },
  };
  return req;
};

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.bankId = 'BANKID';
  res.bankInternalRefName = 'My test';
  res.status = 'Draft';
  return res;
};

const MockExporterResponse = () => {
  const res = {};
  res.details = {};
  res.status = 'IN_PROGRESS';
  res.validation = {};
  res.details.companiesHouseRegistrationNumber = 'tedsi';
  res.validation.required = [];
  return res;
};

const MockEligibilityCriteriaResponse = () => ({
  terms: [
    {
      id: 'coverStart',
      htmlText: '<p>Some eligibility criteria</p>',
      errMsg: '12. Select some eligibilty',
    },
  ],
});

const MockFacilityResponse = () => {
  const res = {};
  res.status = 'IN_PROGRESS';
  res.data = [];
  return res;
};

describe('controllers/application-abandon', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = new MockResponse();
    mockRequest = new MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getExporter.mockResolvedValue(MockExporterResponse());
    api.getFacilities.mockResolvedValue(MockFacilityResponse());
    api.getEligibilityCriteria.mockResolvedValue(MockEligibilityCriteriaResponse());
    api.setApplicationStatus.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET application abandon', () => {
    it('renders the confirm application abandon page', async () => {
      await confirmAbandonApplication(mockRequest, mockResponse);

      expect(mockResponse.render)
        .toHaveBeenCalledWith('application-abandon.njk', expect.objectContaining({
          application: mockApplicationResponse,
        }));
    });

    it('redirects to the application details page if application is not abondonable', async () => {
      mockApplicationResponse.status = 'SUBMITTED_TO_UKEF';
      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

      await confirmAbandonApplication(mockRequest, mockResponse);

      expect(mockResponse.redirect)
        .toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('returns next(err) if there is an issue with the API', async () => {
      const mockNext = jest.fn();
      const error = new Error('error');

      api.getApplication.mockRejectedValueOnce(error);
      await confirmAbandonApplication(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('POST abandonApplication', () => {
    it('redirects to dashboard url if update is successful', async () => {
      await abandonApplication(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard/gef');
    });

    it('returns next(err) if update is unsuccessful', async () => {
      const mockNext = jest.fn();
      const err = new Error();

      api.setApplicationStatus.mockRejectedValueOnce(err);

      await abandonApplication(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });
});
