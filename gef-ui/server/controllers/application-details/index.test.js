import {
  applicationDetails,
  postApplicationDetails,
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
  return req;
};

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.coverTermsId = '123';
  res.bankInternalRefName = 'My test';
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

const MockFacilityResponse = () => {
  const res = {};
  res.status = 'IN_PROGRESS';
  res.data = [];
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Application Details', () => {
  it('renders the `Application Details` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();
    const mockFacilityResponse = new MockFacilityResponse();

    mockFacilityResponse.items = [{ details: { type: 'CASH' }, validation: { required: [] } }];
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    await applicationDetails(mockRequest, mockResponse);
    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
        bankInternalRefName: 'My test',
        exporter: {
          status: expect.any(Object),
          rows: expect.any(Array),
        },
        coverTerms: {
          status: expect.any(Object),
          rows: expect.any(Array),
        },
        facilities: {
          status: expect.any(Object),
          data: expect.any(Array),
        },
        submit: expect.any(Boolean),
      }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getApplication = () => Promise.reject();
    await applicationDetails(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('POST Application Details', () => {
  const mockResponse = new MockResponse();
  const mockRequest = new MockRequest();

  it('redirects to submission url', async () => {
    postApplicationDetails(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/submit');
  });
});
