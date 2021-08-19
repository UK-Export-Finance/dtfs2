import {
  confirmAbandonApplication,
  abandonApplication,
} from './index';
import * as api from '../../services/api';

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
  res.coverTermsId = '123';
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

const MockCoverTermsResponse = () => {
  const res = {};
  res.status = 'NOT_STARTED';
  res.details = {};
  res.validation = {};
  res.validation.required = [];
  res.data = [];
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

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET application abandon', () => {
  it('renders the confirm application abandon page', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();
    const mockFacilityResponse = new MockFacilityResponse();
    const mockEligibiltyCriteriaResponse = new MockEligibilityCriteriaResponse();

    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    api.getEligibilityCriteria = () => Promise.resolve(mockEligibiltyCriteriaResponse);
    await confirmAbandonApplication(mockRequest, mockResponse);

    expect(mockResponse.render)
      .toHaveBeenCalledWith('application-abandon.njk', expect.objectContaining({
        application: mockApplicationResponse,
      }));
  });

  it('redirects to the application details page if application is not abondonable', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockApplicationResponse = new MockApplicationResponse();
    mockApplicationResponse.status = 'SUBMITTED_TO_UKEF';
    const mockExporterResponse = new MockExporterResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();
    const mockFacilityResponse = new MockFacilityResponse();
    const mockEligibiltyCriteriaResponse = new MockEligibilityCriteriaResponse();

    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    api.getEligibilityCriteria = () => Promise.resolve(mockEligibiltyCriteriaResponse);
    await confirmAbandonApplication(mockRequest, mockResponse);

    expect(mockResponse.redirect)
      .toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('returns next(err) if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockNext = jest.fn();
    const error = new Error('error');

    api.getApplication = () => Promise.reject(error);
    await confirmAbandonApplication(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

describe('POST abandonApplication', () => {
  const mockResponse = new MockResponse();
  const mockRequest = new MockRequest();

  it('redirects to dashboard url if update is successful', async () => {
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();
    const mockFacilityResponse = new MockFacilityResponse();
    const mockEligibiltyCriteriaResponse = new MockEligibilityCriteriaResponse();

    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    api.getEligibilityCriteria = () => Promise.resolve(mockEligibiltyCriteriaResponse);
    api.setApplicationStatus = () => Promise.resolve({});

    await abandonApplication(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard/gef');
  });

  it('returns next(err) if update is unsuccessful', async () => {
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();
    const mockFacilityResponse = new MockFacilityResponse();
    const mockEligibiltyCriteriaResponse = new MockEligibilityCriteriaResponse();
    const mockNext = jest.fn();
    const err = new Error();

    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    api.getEligibilityCriteria = () => Promise.resolve(mockEligibiltyCriteriaResponse);
    api.setApplicationStatus = () => Promise.reject(err);

    await abandonApplication(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(err);
  });
});
