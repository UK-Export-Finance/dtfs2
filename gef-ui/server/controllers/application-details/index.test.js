import {
  applicationDetails,
  postApplicationDetails,
} from '.';
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
      _id: 1235,
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
  res.status = 'DRAFT';
  res.userId = 'mock-user';
  res.supportingInformation = {
    status: 'NOT_STARTED',
  };
  res.eligibility = {
    criteria: [
      { id: 12, answer: null, htmlText: '&lt;p&gt;Test&lt;/p&gt' },
    ],
  };

  res.editedBy = ['MAKER_CHECKER'];
  return res;
};

const MockUserResponse = () => ({
  username: 'maker',
  bank: { id: 'BANKID' },
});

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
      id: 12,
      htmlText: '<p>Some eligibility criteria</p>',
      errMsg: '12. Select some eligibilty',
    },
  ],
});

const MockFacilityResponse = () => {
  const res = {};
  res.status = 'IN_PROGRESS';
  res.data = [];
  res.items = [{
    details: { type: 'CASH' },
    validation: { required: [] },
    createdAt: 20,
  }];
  return res;
};

describe('controllers/about-exporter', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockExporterResponse;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();
    mockExporterResponse = MockExporterResponse();
    mockFacilityResponse = MockFacilityResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getExporter.mockResolvedValue(mockExporterResponse);
    api.getFacilities.mockResolvedValue(mockFacilityResponse);
    api.getEligibilityCriteria.mockResolvedValue(MockEligibilityCriteriaResponse());
    api.getUserDetails.mockResolvedValue(MockUserResponse());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Application Details', () => {
    it('redirects to dashboard if user is not authorised', async () => {
      mockApplicationResponse.bankId = 'ANOTHER_BANK';
      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

      await applicationDetails(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalled();
    });

    it('renders the `Application Details` template', async () => {
      mockFacilityResponse.items = [{
        details: { type: 'CASH' },
        validation: { required: [] },
        createdAt: 20,
      },
      {
        details: { type: 'CONTINGENT' },
        validation: { required: [] },
        createdAt: 10,
      }];

      api.getFacilities.mockResolvedValueOnce(mockFacilityResponse);

      await applicationDetails(mockRequest, mockResponse);
      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
          bankInternalRefName: 'My test',
          exporter: {
            status: expect.any(Object),
            rows: expect.any(Array),
          },
          eligibility: {
            status: {
              code: expect.any(String),
              text: expect.any(String),
              class: expect.any(String),
            },
          },
          facilities: {
            status: expect.any(Object),
            data: expect.any(Array),
          },
          supportingInfo: {
            requiredFields: expect.any(Array),
            status: expect.any(Object),
          },
          submit: expect.any(Boolean),
        }));
    });

    it('renders header details if not DRAFT status', async () => {
      mockApplicationResponse.status = 'BANK_CHECK';

      mockExporterResponse.details.industries = ['Mock Industry', 'Another Industry'];

      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
      api.getExporter.mockResolvedValueOnce(mockExporterResponse);

      await applicationDetails(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
        applicationStatus: 'BANK_CHECK',
      }));
    });

    it('renders application preview for checker', async () => {
      mockApplicationResponse.status = 'SUBMITTED_TO_UKEF';

      mockApplicationResponse.checker = {
        firstname: 'Mock',
        surname: 'User',
      };

      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

      await applicationDetails(mockRequest, mockResponse);
      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
          checkedBy: 'Mock User',
        }));
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      const mockNext = jest.fn();
      api.getApplication.mockRejectedValue();

      await applicationDetails(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('POST Application Details', () => {
    it('redirects to submission url', async () => {
      postApplicationDetails(mockRequest, mockResponse);

      expect(mockResponse.redirect)
        .toHaveBeenCalledWith('/gef/application-details/123/submit');
    });
  });
});
